"""
Phase 2 / step 2: regenerate the Resources document library in src/data.jsx.

Sources:
  - tools/resources_manifest.json   (SDS + method statements, from publish_docs.py)
  - src/data.jsx SOLUTIONS          (TDS links, already public from phase 1)

Emits, in src/data.jsx:
  - const DOC_BASE = '<erp host>'   (single swappable base -> branded subdomain later)
  - RESOURCE_TYPES = [tds, sds, spec]   (catalog + cert removed)
  - RESOURCES = [...]   trilingual rows, each { type, code, en, ar, es, url, size, fmt }
    where `url` is a host-relative path; the page builds DOC_BASE + url.

Run after publish_docs.py:  python tools/build_resources.py
"""
import json, re, os, urllib.request, urllib.parse

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "src", "data.jsx")
MANIFEST = os.path.join(HERE, "resources_manifest.json")
ERP = "https://apcv14.lynx.sa"
# ERP API token — set ERP_TOKEN in your environment, e.g. "token <key>:<secret>"
# (kept out of source so the credential never enters git history).
AUTH = {"Authorization": os.environ["ERP_TOKEN"]} if os.environ.get("ERP_TOKEN") else {}

SUFFIX = {
    "tds": {"en": "Technical Data Sheet", "ar": "نشرة فنية", "es": "Ficha Técnica"},
    "sds": {"en": "Safety Data Sheet", "ar": "نشرة سلامة", "es": "Ficha de Seguridad"},
    "spec": {"en": "Method Statement", "ar": "بيان طريقة", "es": "Procedimiento de Aplicación"},
}

TYPES_JS = """const RESOURCE_TYPES = [
  { id: 'tds', en: 'Technical Data Sheets', ar: 'النشرات الفنية', es: 'Fichas Técnicas', icon: 'file-text' },
  { id: 'sds', en: 'Safety Data Sheets', ar: 'نشرات السلامة', es: 'Fichas de Seguridad', icon: 'shield-check' },
  { id: 'spec', en: 'Method Statements', ar: 'بيانات الطريقة', es: 'Procedimientos de Aplicación', icon: 'clipboard' },
];"""


DOCWORD = re.compile(r"\b(msds|sds|tds|mos|method of statement|method|statement|meth|ms)\b", re.I)


def tidy_product(name):
    """drop redundant doc-type words a few source filenames carried into the name."""
    s = DOCWORD.sub("", name)
    s = re.sub(r"\s+", " ", s).strip(" -_")
    return s or name


def js(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def hsize(b):
    b = int(b or 0)
    if b <= 0:
        return ""
    if b < 1024 * 1024:
        return f"{round(b / 1024)} KB"
    return f"{b / 1024 / 1024:.1f} MB"


_HEAD = {}


def head(url_path):
    """no-auth HEAD (visitor's view) -> (status, size). Cached. Paths are URL-safe."""
    if url_path in _HEAD:
        return _HEAD[url_path]
    try:
        r = urllib.request.urlopen(urllib.request.Request(ERP + url_path, method="HEAD"), timeout=25)
        res = (r.status, int(r.headers.get("Content-Length", 0)))
    except urllib.error.HTTPError as e:
        res = (e.code, 0)
    except Exception:
        res = (0, 0)
    _HEAD[url_path] = res
    return res


def to_path(url):
    """strip ERP host -> host-relative path (keep already-relative as-is)."""
    if url.startswith("http"):
        return urllib.parse.urlparse(url).path
    return url


def prune_dead_product_tds(src):
    """HEAD every product TDS in SOLUTIONS; remove dead links so those product
    cards fall back to 'Request TDS' instead of 404ing. Returns (src, dead_set)."""
    sol = src[:src.index("const DOC_BASE =")] if "const DOC_BASE =" in src else src
    fulls = set(re.findall(r"tds:\s*'([^']+)'", sol))
    dead = set()
    for full in fulls:
        st, _ = head(to_path(full))
        if st != 200:
            dead.add(full)
            src = src.replace(f"tds: {js(full)}, ", "").replace(f", tds: {js(full)}", "")
    return src, dead


def extract_tds(src):
    """pull (product, path) for every product TDS still in SOLUTIONS (one obj/line)."""
    rows, seen = [], set()
    for line in src.splitlines():
        if "tds:" not in line:
            continue
        mt = re.search(r"tds:\s*'([^']+)'", line)
        mn = re.search(r"en:\s*\{\s*name:\s*'((?:[^'\\]|\\.)*)'", line)
        mc = re.search(r"code:\s*'((?:[^'\\]|\\.)*)'", line)
        if not mt:
            continue
        name = (mn.group(1) if mn else (mc.group(1) if mc else "")).replace("\\'", "'")
        path = to_path(mt.group(1))
        if path in seen:
            continue
        seen.add(path)
        rows.append(("tds", name, path, 0))
    return rows


def row_js(type_id, product, path, size):
    suf = SUFFIX[type_id]
    en = f"{product} — {suf['en']}"
    ar = f"{product} — {suf['ar']}"
    es = f"{product} — {suf['es']}"
    parts = [
        f"type: {js(type_id)}", f"code: {js(product)}",
        f"en: {js(en)}", f"ar: {js(ar)}", f"es: {js(es)}",
        f"url: {js(path)}", f"size: {js(hsize(size))}", "fmt: 'PDF'",
    ]
    return "  { " + ", ".join(parts) + " },"


def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else []

    src = open(DATA, encoding="utf-8").read()

    # 1) remove dead product-TDS links so Solution Detail cards fall back gracefully
    src, dead = prune_dead_product_tds(src)
    print(f"dead product TDS links pruned: {len(dead)}")

    # 2) TDS list (the surviving public links), sized via the same cached HEAD
    tds = [(t, n, p, head(p)[1]) for (t, n, p, _) in extract_tds(src)]

    # 3) SDS + method statements from the manifest, each validated (drop any non-200)
    def valid(rows):
        out, dropped = [], 0
        for t, n, p, _ in rows:
            st, sz = head(p)
            if st == 200:
                out.append((t, n, p, sz))
            else:
                dropped += 1
        return out, dropped

    sds, d1 = valid([("sds", tidy_product(m["product"]), to_path(m["url"]), 0)
                     for m in manifest if m["type"] == "sds"])
    spec, d2 = valid([("spec", tidy_product(m["product"]), to_path(m["url"]), 0)
                      for m in manifest if m["type"] == "spec"])
    if d1 or d2:
        print(f"dropped unreachable docs -> sds {d1}, spec {d2}")

    allrows = []
    for group in (tds, sds, spec):
        for (t, n, p, s) in sorted(group, key=lambda r: r[1].lower()):
            allrows.append(row_js(t, n, p, s))

    resources_js = "const RESOURCES = [\n" + "\n".join(allrows) + "\n];"

    # idempotent anchor: re-runs replace from the DOC_BASE line if it already exists
    i1 = src.index("const DOC_BASE =") if "const DOC_BASE =" in src else src.index("const RESOURCE_TYPES = [")
    careers = src.index("/* ---------------------------------------------------------------\n   4 · CAREERS")
    header = ("const DOC_BASE = 'https://apcv14.lynx.sa';  // swap to a branded docs domain in one line\n"
              + TYPES_JS + "\n\n" + resources_js + "\n\n")
    src = src[:i1] + header + src[careers:]

    # export DOC_BASE as a global
    if "DOC_BASE" not in src.split("Object.assign(window, {")[1].split("});")[0]:
        src = src.replace("  STORES, KSA_BORDER,\n", "  STORES, KSA_BORDER, DOC_BASE,\n")

    open(DATA, "w", encoding="utf-8").write(src)
    print(f"RESOURCES written: {len(allrows)} (tds {len(tds)}, sds {len(sds)}, spec {len(spec)})")


if __name__ == "__main__":
    main()
