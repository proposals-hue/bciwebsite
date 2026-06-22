"""BCI ERP finished-product rows -> website product data.

This module is intentionally pure-ish and reusable.  OpenClaw fetches live ERP
rows, then calls this file to generate the website product artifacts.
"""

from __future__ import annotations

import collections
import html
import io
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


ERP_DEFAULT = "https://apcv14.lynx.sa"
FG_GROUP = "BCI-Finished Products"
COMPONENT_GROUP = "BCI-Finished Products Components"

CAT_SLUG = {
    "Waterproofing & Roofing": "waterproofing-roofing",
    "Polyurea & Elastomeric Membranes": "polyurea-membranes",
    "Polyurethane Foam & Insulation": "pu-foam-insulation",
    "Flooring Systems": "flooring-systems",
    "Protective & Industrial Coatings": "protective-coatings",
    "Concrete Repair & Surface Preparation": "concrete-repair",
    "Tile Adhesives, Grouts & Anchors": "tile-grouts-anchors",
    "Sealants, Joints & Adhesives": "sealants-joints",
    "Admixtures, Curing & Construction Aids": "admixtures-aids",
}
SLUG_CAT = {v: k for k, v in CAT_SLUG.items()}
CATEGORY_OPTIONS = list(CAT_SLUG.keys())

COLORS = [
    "DARK BROWN",
    "LIGHT BROWN",
    "TRAFFIC BLUE",
    "DARK GREY",
    "DARK GRAY",
    "WHITE",
    "BLACK",
    "GREY",
    "GRAY",
    "GREEN",
    "CLEAR",
    "YELLOW",
    "BROWN",
    "CREAMY",
    "CREAM",
    "BEIGE",
    "BIEGE",
    "PINK",
    "BLUE",
    "ORANGE",
    "RED",
    "PURPLE",
    "ALUMINIUM",
    "ALUMINUM",
    "SLATED",
]
PACKWORDS = [
    "SYSTEM",
    "SET",
    "DRUM",
    "PAIL",
    "CARTON",
    "ROLL",
    "BOARD",
    "KIT",
    "BAG",
    "CAN",
    "SAUSAGE",
    "CARTRIDGE",
    "BUCKET",
]
COMPONENT_RE = re.compile(r"\b(POLYOL|ISOCYANATE)\b", re.I)
PART_RE = re.compile(r"\bPART\b|\bPART-?\s*[AB]\b", re.I)

KEEP_UPPER = {
    "BC",
    "BCI",
    "FC",
    "SL",
    "SLF",
    "EPU",
    "ECR",
    "GRP",
    "PU",
    "PUR",
    "MC",
    "HMP",
    "SBR",
    "PVA",
    "PVC",
    "XPS",
    "PIR",
    "SWP",
    "FR",
    "AL",
    "CA",
    "AR",
    "WH",
    "WB",
    "LC",
    "FD",
    "SF",
    "TF",
    "AS",
    "HF",
    "TH",
    "RBC",
    "CB",
    "ZM",
    "RF",
    "EG",
    "SG",
    "TP",
    "PG",
    "PS",
    "HT",
    "SM",
    "XP",
    "GP",
    "LV",
    "RAL",
    "TC",
    "SHF",
    "EPR",
    "PE",
    "AAC",
    "UV",
}

NAME_FIX = {
    "BC Faced Flexible Flashing": "BC Aluminum-Faced Flexible Flashing",
    "BC PIR Mm": "BC PIR Board",
    "BC XPS 32 10cmx60cmx125cm": "BC XPS Board 100 mm",
    "BC XPS 32 7cmx60cmx125cm": "BC XPS Board 70 mm",
    "BC XPS 32 5cmx60cmx125cm": "BC XPS Board 50 mm",
    "BC Coat Shf": "BC Coat SHF",
    "BC PU Tc": "BC PU TC",
    "BC PU": "BC PU Clear",
    "BC 702 45": "BC 702 Spray 45",
    "BC 702 40 FR": "BC 702 Spray 40 FR",
    "BC Pe Grout": "BC PE Grout",
    "BC Epr Injection": "BC EPR Injection",
    "BC Coat Epu 400": "BC Coat EPU 400",
    "BC Coat Epu": "BC Coat EPU",
    "BC Floor Epu 100": "BC Floor EPU 100",
    "BC Poxy Terazzo 1000 LV": "BC Poxy Terrazzo 1000 LV",
    "BC Geo Textile 200": "BC Geotextile 200 g/m2",
}
MERGE = {
    "BC Geo Textile": "BC Geotextile",
    "BC Geo Textile 200": "BC Geotextile",
    "BC Geotex Tile": "BC Geotextile",
    "Geotextile": "BC Geotextile",
}
CAT_FALLBACK = {
    "waterproofing-roofing": "waterproofing & roofing",
    "polyurea-membranes": "polyurea & elastomeric membrane",
    "pu-foam-insulation": "polyurethane foam & insulation",
    "flooring-systems": "flooring",
    "protective-coatings": "protective & industrial coating",
    "concrete-repair": "concrete repair & surface preparation",
    "tile-grouts-anchors": "tile, grout & anchoring",
    "sealants-joints": "sealant, joint & adhesive",
    "admixtures-aids": "admixture & construction aid",
}


def category_to_slug(value: object) -> Optional[str]:
    text = str(value or "").strip()
    if not text:
        return None
    if text in SLUG_CAT:
        return text
    return CAT_SLUG.get(text)


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "item"


def smart_title(key: str) -> str:
    out = []
    for word in key.split():
        if word in KEEP_UPPER or re.fullmatch(r"\d+[A-Z]?", word):
            out.append(word)
        elif re.fullmatch(r"[A-Z]\d+", word) or re.fullmatch(r"\d+", word):
            out.append(word)
        else:
            out.append(word.capitalize())
    return " ".join(out)


def clean_display(name: str) -> str:
    cleaned = re.sub(r"\bFOAMCONCRETE\b", "Foam Concrete", name, flags=re.I)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return smart_title(cleaned)


def family_key(item_name: str) -> str:
    name = " " + str(item_name or "").upper() + " "
    name = name.replace("-", " - ")
    name = re.sub(r"\bFOAM\s+CONCRETE\b", " FOAMCONCRETE ", name)
    name = re.sub(r"\(\s*FG\s*\)", " ", name)
    name = re.sub(r"\bFG\b", " ", name)
    name = re.sub(r"\b(POLYUREA|FOAM|SPRAY|SPARY)\b", " ", name)
    name = re.sub(r"\b\d+(\.\d+)?\s*(KG/M3|G/M2|GMS?\s*/?\s*M2|GSM|KG|KGS|L|LTR|ML|G|MM|CM|UM|M2)\b", " ", name)
    name = re.sub(r"\b\d+\s*[xX]\s*\d+\s*[xX]\s*\d+\b", " ", name)
    name = re.sub(r"\b\d+\s*[xX]\s*\d+\b", " ", name)
    name = re.sub(r"\bRAL\s*\d{3,4}\b", " ", name)
    name = re.sub(r"\(\s*\d{2,4}\s*\)", " ", name)
    name = re.sub(r"\bPART\s*[-]?\s*[AB]\b", " ", name)
    name = re.sub(r"\bPART\b", " ", name)
    name = COMPONENT_RE.sub(" ", name)
    for word in PACKWORDS:
        name = re.sub(r"\b" + re.escape(word) + r"\b", " ", name)
    for color in COLORS:
        name = re.sub(r"\b" + re.escape(color) + r"\b", " ", name)
    name = re.sub(r"\(\s*P\s*\)", " ", name)
    name = re.sub(r"\b[AB]\b", " ", name)
    name = re.sub(r"\bP\b", " ", name)
    name = re.sub(r"\bDENSITY\s*\d+\b", " ", name)
    name = re.sub(r"\b\d+\.\d+\b", " ", name)
    name = re.sub(r"[^A-Z0-9 ]", " ", name)
    return re.sub(r"\s+", " ", name).strip()


def strip_html(value: object) -> str:
    text = re.sub(r"<[^>]+>", " ", str(value or ""))
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def as_float(value: object) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def pack_label(rec: Dict) -> str:
    size = str(rec.get("custom_size_of_can") or "").strip()
    if size:
        return re.sub(r"\s+", " ", size)

    pkg = str(rec.get("custom_packaging") or rec.get("stock_uom") or "").strip()
    pkg_l = pkg.lower()
    pkg_for_label = "" if pkg_l in ("", "nos") else pkg_l
    kg = as_float(rec.get("custom_packaging_in_kg"))
    liter = as_float(rec.get("custom_packaging_in_liter"))

    if kg > 1.2:
        return f"{kg:g} kg" + (f" {pkg_for_label}" if pkg_for_label else "")
    if liter > 0:
        return f"{liter:g} L" + (f" {pkg_for_label}" if pkg_for_label else "")
    if pkg_for_label:
        return pkg_for_label.capitalize()
    return ""


def colors_for_record(rec: Dict) -> List[str]:
    explicit = str(rec.get("custom_color_selection") or "").strip()
    if explicit:
        parts = re.split(r"[,/\n;]+", explicit)
        return sorted({p.strip().title() for p in parts if p.strip()})

    found = set()
    up = str(rec.get("item_name") or rec.get("item_code") or "").upper()
    for color in COLORS:
        if re.search(r"\b" + re.escape(color) + r"\b", up):
            found.add(color.title())
    return sorted(found)


def add_record_to_family(family: Dict, rec: Dict) -> None:
    item_name = str(rec.get("item_name") or rec.get("item_code") or rec.get("name") or "").strip()
    if item_name:
        family["members"].append(item_name)
    desc = strip_html(rec.get("description"))
    if desc:
        family["descs"].append(desc)
    if rec.get("image"):
        family["imgs"].append(str(rec["image"]))
    if rec.get("custom_tdsattachement"):
        family["tds"].append(str(rec["custom_tdsattachement"]))
    pack = pack_label(rec)
    if pack:
        family["sizes"].add(pack)
    for color in colors_for_record(rec):
        family["colors"].add(color)


def new_family(slug: str, key: str) -> Dict:
    return {
        "slug": slug,
        "key": key,
        "name": clean_display(key),
        "members": [],
        "descs": [],
        "imgs": [],
        "tds": [],
        "sizes": set(),
        "colors": set(),
        "is_component": False,
    }


def group_items(records: Iterable[Dict]) -> Tuple[List[Dict], Dict]:
    """Collapse ERP item rows into website product families.

    Publish gate:
      - only FG rows with custom_bci_website_sync ticked (1; legacy "Yes") create public families
      - component rows only enrich already-published matching families
    """
    records = list(records)
    families: "collections.OrderedDict[Tuple[str, str], Dict]" = collections.OrderedDict()
    support_rows = []
    skipped = collections.Counter()
    missing_category = []

    for rec in records:
        group = str(rec.get("item_group") or "").strip()
        if group != FG_GROUP:
            if group == COMPONENT_GROUP:
                support_rows.append(rec)
            continue
        # Checkbox is stored as 1/0; accept legacy "Yes" too so the switch is race-proof.
        if str(rec.get("custom_bci_website_sync") or "").strip().lower() not in ("1", "yes", "true"):
            skipped["not_yes"] += 1
            continue
        slug = category_to_slug(rec.get("custom_bci_website_category"))
        if not slug:
            skipped["missing_category"] += 1
            missing_category.append(rec.get("item_code") or rec.get("name"))
            continue
        key = family_key(rec.get("item_name") or rec.get("item_code") or rec.get("name") or "")
        if not key:
            skipped["blank_family_key"] += 1
            continue
        fam_key = (slug, key)
        if fam_key not in families:
            families[fam_key] = new_family(slug, key)
        add_record_to_family(families[fam_key], rec)

    # Component rows can enrich a published family with matching key.
    key_to_families: Dict[str, List[Dict]] = collections.defaultdict(list)
    for (_slug, key), fam in families.items():
        key_to_families[key].append(fam)
    for rec in support_rows:
        key = family_key(rec.get("item_name") or rec.get("item_code") or rec.get("name") or "")
        targets = key_to_families.get(key) or []
        if not targets:
            skipped["component_no_published_family"] += 1
            continue
        for fam in targets:
            add_record_to_family(fam, rec)

    out = []
    for fam in families.values():
        descs = sorted(set(fam["descs"]), key=lambda text: (-len(text), text.casefold()))
        imgs = sorted(set(fam["imgs"]))
        tds = sorted(set(fam["tds"]))
        out.append(
            {
                "slug": fam["slug"],
                "key": fam["key"],
                "name": fam["name"],
                "n_skus": len(fam["members"]),
                "members": sorted(set(fam["members"])),
                "desc": descs[0] if descs else "",
                "n_desc": len(descs),
                "img": imgs[0] if imgs else None,
                "n_img": len(imgs),
                "tds": tds[0] if tds else None,
                "n_tds": len(tds),
                "sizes": sorted(fam["sizes"]),
                "colors": sorted(fam["colors"]),
                "component_only": False,
            }
        )

    summary = {
        "source_rows": len(records),
        "families": len(out),
        "skipped": dict(skipped),
        "missing_category": sorted(x for x in missing_category if x),
    }
    return out, summary


def clean_desc(desc: str, name: str, slug: str) -> str:
    text = desc or ""
    text = re.sub(r",?\s*(approx\.?\s*)?[\d.\-]+\s*SAR\s*/?\s*m[2]?", "", text, flags=re.I)
    text = re.sub(r"\bSAR\s*/?\s*m[2]?", "", text, flags=re.I)
    text = re.sub(r"\b-?\s*FG\b", "", text)
    text = re.sub(r"\((system|p)\)", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" ,;-")
    looks_codeish = (len(text) < 45) or bool(re.search(r"\bKG\b|\bML\b|RAL\s*\d", text))
    if not text or looks_codeish:
        return (
            f"{name} - part of BCI's {CAT_FALLBACK[slug]} range, "
            "manufactured in Saudi Arabia. Download the technical data sheet "
            "for full specifications."
        )
    if text.lower().startswith(name.lower() + " "):
        text = text[len(name) :].lstrip(" -:")
        text = text[:1].upper() + text[1:]
    if len(text) > 320:
        cut = text[:320]
        dot = cut.rfind(". ")
        text = cut[: dot + 1] if dot > 120 else cut.rstrip() + "..."
    return text


def pick_sizes(sizes: Iterable[str]) -> List[str]:
    items = list(sizes)
    weighted = [s for s in items if re.match(r"\s*\d", s)]
    return weighted or items


def tds_url(path_value: object, erp_base: str = ERP_DEFAULT) -> Optional[str]:
    raw = str(path_value or "").strip()
    if not raw:
        return None
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw.replace(" ", "%20")
    if "/files/" in raw:
        tail = raw.split("/files/", 1)[1]
    elif "/private/files/" in raw:
        tail = raw.split("/private/files/", 1)[1]
    else:
        tail = raw.lstrip("/")
    return erp_base.rstrip("/") + "/files/" + urllib.parse.quote(tail, safe="/()[]-%")


def merge_and_build_products(families: Iterable[Dict], erp_base: str = ERP_DEFAULT) -> Tuple[Dict[str, List[Dict]], Dict[str, str]]:
    merged: "collections.OrderedDict[Tuple[str, str], Dict]" = collections.OrderedDict()
    for fam in families:
        display = fam["name"]
        canon = MERGE.get(display, display)
        key = (fam["slug"], canon)
        if key not in merged:
            item = dict(fam)
            item["name"] = canon
            item["_sizes"] = set(fam.get("sizes") or [])
            item["_colors"] = set(fam.get("colors") or [])
            merged[key] = item
        else:
            item = merged[key]
            item["_sizes"] |= set(fam.get("sizes") or [])
            item["_colors"] |= set(fam.get("colors") or [])
            if not item.get("img") and fam.get("img"):
                item["img"] = fam["img"]
            if not item.get("tds") and fam.get("tds"):
                item["tds"] = fam["tds"]
            if len(fam.get("desc") or "") > len(item.get("desc") or ""):
                item["desc"] = fam["desc"]

    by_slug: Dict[str, List[Dict]] = collections.defaultdict(list)
    image_manifest: Dict[str, str] = {}
    used_files: Dict[str, str] = {}

    for (slug, canon), fam in merged.items():
        name = NAME_FIX.get(canon, canon)
        sizes = pick_sizes(sorted(fam["_sizes"]))
        colors = sorted(c for c in fam["_colors"] if c.lower() != "clear")
        desc = clean_desc(fam.get("desc") or "", name, slug)

        img_path = None
        src = fam.get("img")
        if src:
            if src in image_manifest:
                img_file = image_manifest[src]
            else:
                base = slugify(name)
                img_file = base + ".jpg"
                suffix = 2
                while img_file in used_files and used_files[img_file] != src:
                    img_file = f"{base}-{suffix}.jpg"
                    suffix += 1
                used_files[img_file] = src
                image_manifest[src] = img_file
            img_path = "assets/products/" + img_file

        by_slug[slug].append(
            {
                "code": name,
                "name": name,
                "desc": desc,
                "sizes": sizes,
                "colors": colors,
                "img": img_path,
                "tds": tds_url(fam.get("tds"), erp_base),
            }
        )

    for slug in by_slug:
        by_slug[slug].sort(key=lambda row: row["name"].lower())
    return dict(by_slug), image_manifest


def js(value: object) -> str:
    text = str(value)
    return "'" + text.replace("\\", "\\\\").replace("'", "\\'") + "'"


def emit_products(items: List[Dict]) -> str:
    lines = []
    for product in items:
        parts = [f"code: {js(product['code'])}"]
        if product.get("img"):
            parts.append(f"img: {js(product['img'])}")
        if product.get("tds"):
            parts.append(f"tds: {js(product['tds'])}")
        parts.append("sizes: [" + ", ".join(js(size) for size in product.get("sizes") or []) + "]")
        if product.get("colors"):
            parts.append("colors: [" + ", ".join(js(color) for color in product["colors"]) + "]")
        name = js(product["name"])
        desc = js(product["desc"])
        parts.append(f"en: {{ name: {name}, desc: {desc} }}")
        parts.append(f"ar: {{ name: {name}, desc: {desc} }}")
        parts.append(f"es: {{ name: {name}, desc: {desc} }}")
        parts.append("tags: ['Saudi-Made']")
        lines.append("      { " + ", ".join(parts) + " },")
    return "[\n" + "\n".join(lines) + "\n    ]"


def write_products_to_data(data_path: Path, by_slug: Dict[str, List[Dict]]) -> int:
    src = data_path.read_text(encoding="utf-8")
    start = src.index("const SOLUTIONS = [")
    end = src.index("/* ---------------------------------------------------------------\n   2")
    block = src[start:end]
    pattern = re.compile(r"(slug: '([^']+)'.*?\n    products: )\[.*?\n    \],", re.S)

    def replace(match: re.Match) -> str:
        return match.group(1) + emit_products(by_slug.get(match.group(2), [])) + ","

    new_block, count = pattern.subn(replace, block)
    if count != 9:
        raise RuntimeError(f"expected 9 solution categories, replaced {count}")
    data_path.write_text(src[:start] + new_block + src[end:], encoding="utf-8")
    return sum(len(items) for items in by_slug.values())


def write_families_review(path: Path, families: Iterable[Dict]) -> None:
    by_slug: Dict[str, List[Dict]] = collections.defaultdict(list)
    for fam in families:
        by_slug[fam["slug"]].append(fam)
    total = sum(len(v) for v in by_slug.values())
    lines = [f"# Grouped product families ({total})", ""]
    for slug in CAT_SLUG.values():
        items = sorted(by_slug.get(slug, []), key=lambda f: f["name"].lower())
        lines.append(f"## {SLUG_CAT[slug]} ({len(items)})")
        lines.append("")
        for fam in items:
            flags = []
            if not fam.get("img"):
                flags.append("NO-IMG")
            if not fam.get("tds"):
                flags.append("NO-TDS")
            suffix = " [" + ", ".join(flags) + "]" if flags else ""
            lines.append(f"- **{fam['name']}** [{fam['n_skus']} skus]{suffix}")
            if fam.get("sizes"):
                lines.append(f"  - sizes: {', '.join(fam['sizes'])}")
            if fam.get("colors"):
                lines.append(f"  - colors: {', '.join(fam['colors'])}")
            if fam.get("desc"):
                lines.append(f"  - desc: {fam['desc'][:160]}")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def fetch_images(
    image_manifest: Dict[str, str],
    output_dir: Path,
    erp_base: str = ERP_DEFAULT,
    auth_header: Optional[str] = None,
    force: bool = False,
) -> Dict:
    from PIL import Image, ImageOps

    output_dir.mkdir(parents=True, exist_ok=True)
    headers = {"Authorization": auth_header} if auth_header else {}
    summary = {"downloaded": 0, "skipped": 0, "failed": 0, "failures": []}

    for src, filename in image_manifest.items():
        out = output_dir / filename
        if out.exists() and not force:
            summary["skipped"] += 1
            continue
        try:
            url = erp_base.rstrip("/") + urllib.parse.quote(str(src), safe="/()[]-%")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=45) as response:
                raw = response.read()
            image = Image.open(io.BytesIO(raw))
            image = ImageOps.exif_transpose(image).convert("RGB")
            if image.width > 720:
                image = image.resize((720, round(image.height * 720 / image.width)), Image.LANCZOS)
            image.save(out, "JPEG", quality=72, optimize=True, progressive=True)
            summary["downloaded"] += 1
        except Exception as exc:  # pragma: no cover - exercised in live sync only
            summary["failed"] += 1
            summary["failures"].append({"file": filename, "source": src, "error": f"{type(exc).__name__}: {exc}"})
    return summary


def run_pipeline(
    records: Iterable[Dict],
    website_root: Path,
    erp_base: str = ERP_DEFAULT,
    fetch_product_images: bool = False,
    auth_header: Optional[str] = None,
) -> Dict:
    website_root = Path(website_root)
    tools_dir = website_root / "tools"
    src_dir = website_root / "src"
    families, group_summary = group_items(records)
    by_slug, image_manifest = merge_and_build_products(families, erp_base=erp_base)

    tools_dir.mkdir(parents=True, exist_ok=True)
    (tools_dir / "families.json").write_text(json.dumps(families, ensure_ascii=False, indent=2), encoding="utf-8")
    (tools_dir / "image_manifest.json").write_text(
        json.dumps(image_manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_families_review(tools_dir / "families_review.md", families)
    product_count = write_products_to_data(src_dir / "data.jsx", by_slug)

    image_summary = {"downloaded": 0, "skipped": 0, "failed": 0, "failures": []}
    if fetch_product_images:
        image_summary = fetch_images(
            image_manifest,
            website_root / "assets" / "products",
            erp_base=erp_base,
            auth_header=auth_header,
        )
        if image_summary["failures"]:
            (tools_dir / "image_failures.json").write_text(
                json.dumps(image_summary["failures"], ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

    bycat = {slug: len(by_slug.get(slug, [])) for slug in CAT_SLUG.values()}
    return {
        **group_summary,
        "product_count": product_count,
        "category_counts": bycat,
        "image_manifest_count": len(image_manifest),
        "images": image_summary,
    }


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Generate BCI website products from ERP item rows JSON.")
    parser.add_argument("--input", required=True, help="JSON file containing ERP Item rows.")
    parser.add_argument("--website-root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--erp-base", default=ERP_DEFAULT)
    parser.add_argument("--fetch-images", action="store_true")
    parser.add_argument("--auth-token", default=os.environ.get("ERP_TOKEN", ""))
    args = parser.parse_args()

    rows = json.loads(Path(args.input).read_text(encoding="utf-8"))
    summary = run_pipeline(
        rows,
        Path(args.website_root),
        erp_base=args.erp_base,
        fetch_product_images=args.fetch_images,
        auth_header=args.auth_token or None,
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
