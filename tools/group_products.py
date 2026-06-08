"""
ERP finished-goods -> website product families.

Reads the ERP export (bci_finished_products_raw.json) + the curated
category-mapping markdown, collapses the SKU-level rows (colour / pack-size /
Part-A·B variants) into product FAMILIES, and writes families.json for the
website data layer.

One-off website data-sync tool (phase 1: Solutions/Products). Run:
    python tools/group_products.py
"""
import json, re, os, html, collections

WS = r"C:\Users\DELL\.openclaw\workspace"
RAW = os.path.join(WS, "bci_finished_products_raw.json")
MAPMD = os.path.join(WS, "bci_finished_products_website_categories.md")
OUT = os.path.join(os.path.dirname(__file__), "families.json")

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

# ---- parse category md: item_code(backtick) -> slug -------------------------
def parse_categories():
    code2slug = {}
    slug = None
    for line in open(MAPMD, encoding="utf-8"):
        m = re.match(r"^##\s+(.+?)\s*(\(\d+\))?\s*$", line)
        if m:
            slug = CAT_SLUG.get(m.group(1).strip())
            continue
        if slug and line.lstrip().startswith("-"):
            bt = re.search(r"`([^`]+)`", line)
            if bt:
                code2slug[bt.group(1).strip()] = slug
    return code2slug

# ---- family-key extraction --------------------------------------------------
COLORS = [
    "DARK BROWN", "LIGHT BROWN", "TRAFFIC BLUE", "DARK GREY", "DARK GRAY",
    "WHITE", "BLACK", "GREY", "GRAY", "GREEN", "CLEAR", "YELLOW", "BROWN",
    "CREAMY", "CREAM", "BEIGE", "BIEGE", "PINK", "BLUE", "ORANGE", "RED",
    "PURPLE", "ALUMINIUM", "ALUMINUM", "SLATED",
]
PACKWORDS = ["SYSTEM", "SET", "DRUM", "PAIL", "CARTON", "ROLL", "BOARD",
             "KIT", "BAG", "CAN", "SAUSAGE", "CARTRIDGE", "BUCKET"]
# component / part markers (used to detect raw components)
COMPONENT_RE = re.compile(r"\b(POLYOL|ISOCYANATE)\b", re.I)
PART_RE = re.compile(r"\bPART\b|\bPART-?\s*[AB]\b", re.I)

# tokens that keep their casing in display names
KEEP_UPPER = {"BC", "BCI", "FC", "SL", "SLF", "EPU", "ECR", "GRP", "PU", "PUR",
              "MC", "HMP", "SBR", "PVA", "PVC", "XPS", "PIR", "SWP", "FR", "AL",
              "CA", "AR", "WH", "WB", "LC", "FD", "SF", "TF", "AS", "HF", "TH",
              "RBC", "CB", "ZM", "RF", "EG", "SG", "TP", "PG", "PS", "HT", "SM",
              "XP", "GP", "LV", "RAL", "TC", "SHF", "EPR", "PE", "AAC", "UV"}
def smart_title(key):
    out = []
    for w in key.split():
        if w in KEEP_UPPER or re.fullmatch(r"\d+[A-Z]?", w):
            out.append(w)
        elif re.fullmatch(r"[A-Z]\d+", w) or re.fullmatch(r"\d+", w):
            out.append(w)
        else:
            out.append(w.capitalize())
    return " ".join(out)

def clean_display(name):
    """Customer-facing product name from a family key."""
    n = re.sub(r"\bFOAMCONCRETE\b", "Foam Concrete", name, flags=re.I)
    n = re.sub(r"\s+", " ", n).strip()
    return smart_title(n)

def family_key(item_name):
    n = " " + item_name.upper() + " "
    n = n.replace("-", " - ")
    # protect multi-word product names that contain stripped tokens
    n = re.sub(r"\bFOAM\s+CONCRETE\b", " FOAMCONCRETE ", n)
    # strip FG markers
    n = re.sub(r"\(\s*FG\s*\)", " ", n)
    n = re.sub(r"\bFG\b", " ", n)
    # merge system rows with their raw polyol/isocyanate parts:
    # drop the chemistry-descriptor words so 'BC 237' == 'BC 237 Polyurea'
    n = re.sub(r"\b(POLYUREA|FOAM|SPRAY|SPARY)\b", " ", n)
    # strip pack quantities w/ units
    n = re.sub(r"\b\d+(\.\d+)?\s*(KG/M3|G/M2|GMS?\s*/?\s*M2|GSM|KG|KGS|L|LTR|ML|G|MM|CM|UM|µM)\b", " ", n)
    n = re.sub(r"\b\d+\s*[xX]\s*\d+\s*[xX]\s*\d+\b", " ", n)  # board dims
    n = re.sub(r"\b\d+\s*[xX]\s*\d+\b", " ", n)
    # RAL codes + parenthetical colour numbers
    n = re.sub(r"\bRAL\s*\d{3,4}\b", " ", n)
    n = re.sub(r"\(\s*\d{2,4}\s*\)", " ", n)
    # part / system / pack / component words
    n = re.sub(r"\bPART\s*[-]?\s*[AB]\b", " ", n)
    n = re.sub(r"\bPART\b", " ", n)
    n = COMPONENT_RE.sub(" ", n)
    for w in PACKWORDS:
        n = re.sub(r"\b" + w + r"\b", " ", n)
    for c in COLORS:
        n = re.sub(r"\b" + re.escape(c) + r"\b", " ", n)
    # stray single letters left from Part-A etc, and standalone P/(P)
    n = re.sub(r"\(\s*P\s*\)", " ", n)
    n = re.sub(r"\b[AB]\b", " ", n)
    n = re.sub(r"\bP\b", " ", n)
    # density / leftover decimals (keep bare integers -> they are model numbers)
    n = re.sub(r"\bDENSITY\s*\d+\b", " ", n)
    n = re.sub(r"\b\d+\.\d+\b", " ", n)  # drop decimals (leftover pack qty), keep ints (model ids)
    n = re.sub(r"[^A-Z0-9 ]", " ", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n

def strip_html(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()

def pack_label(rec):
    pkg = (rec.get("custom_packaging") or "").strip()
    kg = rec.get("custom_packaging_in_kg")
    pl = pkg.lower()
    if pl in ("nos", ""):
        pl = ""
    # kg<=1.2 is the ERP "not entered" sentinel for rolls/boards/aerosols
    if kg and kg > 1.2:
        return f"{kg:g} kg" + (f" {pl}" if pl else "")
    # count-based / placeholder weight -> show the pack type only
    return pkg.capitalize() if pl else ""

def main():
    code2slug = parse_categories()
    raw = json.load(open(RAW, encoding="utf-8"))

    fams = collections.OrderedDict()
    unmapped = []
    for rec in raw:
        code = rec.get("item_code") or rec.get("name")
        slug = code2slug.get(code) or code2slug.get(code.strip())
        if not slug:
            unmapped.append(code)
            continue
        iname = (rec.get("item_name") or code).strip()
        key = family_key(iname)
        fk = (slug, key)
        f = fams.get(fk)
        if not f:
            f = fams[fk] = dict(slug=slug, key=key, name=clean_display(key),
                                members=[], descs=[], imgs=[], tds=[],
                                sizes=set(), colors=set(), is_component=True)
        f["members"].append(iname)
        d = strip_html(rec.get("description"))
        if d:
            f["descs"].append(d)
        if rec.get("image"):
            f["imgs"].append(rec["image"])
        if rec.get("custom_tdsattachement"):
            f["tds"].append(rec["custom_tdsattachement"])
        pl = pack_label(rec)
        if pl:
            f["sizes"].add(pl)
        # colour detection from raw name
        up = iname.upper()
        for c in COLORS:
            if re.search(r"\b" + re.escape(c) + r"\b", up):
                f["colors"].add(c.title())
        if not (COMPONENT_RE.search(iname) or PART_RE.search(iname)):
            f["is_component"] = False  # has a sellable system/finished row

    out = []
    dropped = []
    for (slug, key), f in fams.items():
        if f["is_component"]:
            dropped.append(f["name"]); continue
        descs = sorted(set(f["descs"]), key=len, reverse=True)
        out.append(dict(
            slug=slug, key=key, name=f["name"],
            n_skus=len(f["members"]),
            members=f["members"],
            desc=descs[0] if descs else "",
            n_desc=len(descs),
            img=sorted(set(f["imgs"]))[0] if f["imgs"] else None,
            n_img=len(set(f["imgs"])),
            tds=sorted(set(f["tds"]))[0] if f["tds"] else None,
            n_tds=len(set(f["tds"])),
            sizes=sorted(f["sizes"]),
            colors=sorted(f["colors"]),
            component_only=f["is_component"],
        ))
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # review markdown grouped by category
    slug2title = {v: k for k, v in CAT_SLUG.items()}
    rev = os.path.join(os.path.dirname(__file__), "families_review.md")
    with open(rev, "w", encoding="utf-8") as fh:
        fh.write(f"# Grouped product families ({len(out)})\n\n")
        for s in CAT_SLUG.values():
            items = [o for o in out if o["slug"] == s]
            fh.write(f"\n## {slug2title[s]} ({len(items)})\n\n")
            for o in items:
                flags = []
                if not o["img"]: flags.append("NO-IMG")
                if not o["tds"]: flags.append("NO-TDS")
                fl = (" ⚠ " + ",".join(flags)) if flags else ""
                fh.write(f"- **{o['name']}** [{o['n_skus']} skus]{fl}\n")
                fh.write(f"  - sizes: {', '.join(o['sizes'])}\n")
                if o["colors"]:
                    fh.write(f"  - colors: {', '.join(o['colors'])}\n")
                fh.write(f"  - desc: {o['desc'][:160]}\n")

    bycat = collections.Counter(o["slug"] for o in out)
    print(f"families kept: {len(out)}   dropped component-only: {len(dropped)}   unmapped: {len(unmapped)}")
    for s in CAT_SLUG.values():
        print(f"  {s:24} {bycat.get(s,0):3}")
    print(f"families without image: {sum(1 for o in out if not o['img'])}")
    print(f"families without tds:   {sum(1 for o in out if not o['tds'])}")
    print(f"\nreview written -> {rev}")

if __name__ == "__main__":
    main()
