"""
Stage 2: turn families.json into the website product data.

- applies targeted name fixes + merges
- cleans ERP descriptions (strips internal SAR pricing, code-only rows)
- dedupes pack sizes, derives a stable image filename + ERP TDS url
- builds tools/image_manifest.json  (source ERP image -> local asset)
- rewrites the `products: [...]` arrays inside src/data.jsx in place,
  preserving every category's hand-written meta / translations.

Run after group_products.py:  python tools/build_products.py
Then download images:          python tools/fetch_images.py
"""
import json, re, os, hashlib, collections

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
FAM = os.path.join(HERE, "families.json")
DATA = os.path.join(ROOT, "src", "data.jsx")
MANIFEST = os.path.join(HERE, "image_manifest.json")
ERP = "https://apcv14.lynx.sa"

# ---- targeted name fixes (display name -> better display name) --------------
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
    "BC Geo Textile 200": "BC Geotextile 200 g/m²",
}
# merge fragmented geotextile families -> one card
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

def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "item"

def clean_desc(desc, name, slug):
    d = desc or ""
    # strip internal SAR pricing
    d = re.sub(r",?\s*(approx\.?\s*)?[\d.–\-]+\s*SAR\s*/?\s*m[²2]?", "", d, flags=re.I)
    d = re.sub(r"\bSAR\s*/?\s*m[²2]?", "", d, flags=re.I)
    # strip trailing ERP markers / -FG / (System) / (P)
    d = re.sub(r"\b-?\s*FG\b", "", d)
    d = re.sub(r"\((system|p)\)", "", d, flags=re.I)
    d = re.sub(r"\s+", " ", d).strip(" ,;-")
    # code-only / empty descriptions -> safe generic fallback
    looks_codeish = (len(d) < 45) or re.search(r"\bKG\b|\bML\b|RAL\s*\d", d)
    if not d or looks_codeish:
        d = (f"{name} — part of BCI's {CAT_FALLBACK[slug]} range, "
             f"manufactured in Saudi Arabia. Download the technical data sheet "
             f"for full specifications.")
    else:
        # drop a leading echo of the product name ("BC Tar Coat Two-component…")
        if d.lower().startswith(name.lower() + " "):
            d = d[len(name):].lstrip(" -—:")
            d = d[:1].upper() + d[1:]
        # cap length at a sentence boundary near ~300 chars
        if len(d) > 320:
            cut = d[:320]
            dot = cut.rfind(". ")
            d = (cut[:dot + 1] if dot > 120 else cut.rstrip() + "…")
    return d

def pick_sizes(sizes):
    weight = [s for s in sizes if re.match(r"\s*\d", s)]
    return weight or sizes

def main():
    fams = json.load(open(FAM, encoding="utf-8"))

    # apply merges
    merged = collections.OrderedDict()
    for f in fams:
        disp = f["name"]
        canon = MERGE.get(disp, disp)
        key = (f["slug"], canon)
        m = merged.get(key)
        if not m:
            m = merged[key] = dict(f); m["name"] = canon
            m["_sizes"] = set(f["sizes"]); m["_colors"] = set(f["colors"])
        else:
            m["_sizes"] |= set(f["sizes"]); m["_colors"] |= set(f["colors"])
            if not m.get("img") and f.get("img"): m["img"] = f["img"]
            if not m.get("tds") and f.get("tds"): m["tds"] = f["tds"]
            if len(f.get("desc","")) > len(m.get("desc","")): m["desc"] = f["desc"]

    by_slug = collections.defaultdict(list)
    img_manifest = {}            # erp source path -> local filename
    used_files = {}
    for (slug, canon), f in merged.items():
        name = NAME_FIX.get(canon, canon)
        sizes = pick_sizes(sorted(f["_sizes"]))
        colors = sorted(c for c in f["_colors"] if c.lower() != "clear") if f["_colors"] else []
        desc = clean_desc(f.get("desc"), name, slug)
        # image: dedupe by source, stable local filename
        img = None
        src = f.get("img")
        if src:
            if src in img_manifest:
                img = img_manifest[src]
            else:
                base = slugify(name)
                fn = base + ".jpg"; n = 2
                while fn in used_files and used_files[fn] != src:
                    fn = f"{base}-{n}.jpg"; n += 1
                used_files[fn] = src
                img_manifest[src] = fn
                img = fn
        tds = (ERP + "/files/" + f["tds"].split("/files/")[-1].replace(" ", "%20")) if f.get("tds") else None
        by_slug[slug].append(dict(
            code=name, name=name, desc=desc, sizes=sizes, colors=colors,
            img=("assets/products/" + img) if img else None, tds=tds,
        ))

    json.dump(img_manifest, open(MANIFEST, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    # ---- emit JS ------------------------------------------------------------
    def js(s):
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"

    def emit_products(slug):
        items = by_slug.get(slug, [])
        lines = []
        for p in items:
            parts = [f"code: {js(p['code'])}"]
            if p["img"]:
                parts.append(f"img: {js(p['img'])}")
            if p["tds"]:
                parts.append(f"tds: {js(p['tds'])}")
            parts.append("sizes: [" + ", ".join(js(s) for s in p["sizes"]) + "]")
            if p["colors"]:
                parts.append("colors: [" + ", ".join(js(c) for c in p["colors"]) + "]")
            nm = js(p["name"]); ds = js(p["desc"])
            parts.append(f"en: {{ name: {nm}, desc: {ds} }}")
            parts.append(f"ar: {{ name: {nm}, desc: {ds} }}")
            parts.append(f"es: {{ name: {nm}, desc: {ds} }}")
            parts.append("tags: ['Saudi-Made']")
            lines.append("      { " + ", ".join(parts) + " },")
        return "[\n" + "\n".join(lines) + "\n    ]"

    src = open(DATA, encoding="utf-8").read()
    start = src.index("const SOLUTIONS = [")
    end = src.index("/* ---------------------------------------------------------------\n   2 · PROJECTS")
    block = src[start:end]

    pat = re.compile(r"(slug: '([^']+)'.*?\n    products: )\[.*?\n    \],", re.S)
    def repl(m):
        return m.group(1) + emit_products(m.group(2)) + ","
    newblock, n = pat.subn(repl, block)
    assert n == 9, f"expected 9 categories, replaced {n}"

    open(DATA, "w", encoding="utf-8").write(src[:start] + newblock + src[end:])

    total = sum(len(v) for v in by_slug.values())
    print(f"products written: {total} across {len(by_slug)} categories")
    for slug in CAT_FALLBACK:
        print(f"  {slug:24} {len(by_slug.get(slug,[])):3}")
    print(f"unique source images to fetch: {len(img_manifest)}")

if __name__ == "__main__":
    main()
