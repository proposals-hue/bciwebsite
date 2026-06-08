"""
Phase 2 / step 1: publish public copies of the SDS + method-statement PDFs that
live (private) in the ERP "Technical document Master" doctype, so the static
website can link them without auth.

Why copies and not a privacy flag? Toggling File.is_private on this ERP instance
500s (a server-side schema skew in Frappe's File controller). Uploading a fresh
public copy is the reliable path -- and lets us give every file a clean,
professional filename (BC-Cure-311-SDS.pdf) instead of the messy ERP original
(BC  Cure 311.pdf).

Idempotent: a file already public (same clean name) is reused, not re-uploaded.
Reads the cached tdm_dump.json produced during exploration.

Run:  python tools/publish_docs.py
Out:  tools/resources_manifest.json  (group/type/product/url/size per doc)
"""
import json, re, os, urllib.request, urllib.parse, uuid

HERE = os.path.dirname(__file__)
WS = r"C:\Users\DELL\.openclaw\workspace"
DUMP = os.path.join(WS, "tdm_dump.json")
OUT = os.path.join(HERE, "resources_manifest.json")
ERP = "https://apcv14.lynx.sa"
# ERP API token — set ERP_TOKEN in your environment ("token <key>:<secret>").
TOK = os.environ.get("ERP_TOKEN", "")
AUTH = {"Authorization": TOK}

# ERP group name -> (website type id, filename suffix)
GROUPS = {
    "Material Safety Data Sheet": ("sds", "SDS"),
    "Method of statement": ("spec", "Method-Statement"),
}
# method-statement filename noise to strip down to the product name
MOS_NOISE = re.compile(r"\b(method of statement|method|mos|ms\d+|ms|meth|me)\b", re.I)


def api_get(path):
    r = urllib.request.Request(ERP + path, headers={**AUTH, "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(r, timeout=60).read())


def fetch(file_url):
    r = urllib.request.Request(ERP + urllib.parse.quote(file_url), headers=AUTH)
    return urllib.request.urlopen(r, timeout=180).read()


def exists_public(fname):
    f = urllib.parse.quote(json.dumps([["file_url", "=", "/files/" + fname]]))
    fields = urllib.parse.quote(json.dumps(["name", "file_url", "file_size"]))
    d = api_get(f"/api/resource/File?filters={f}&fields={fields}")
    data = d.get("data") or []
    return data[0] if data else None


def upload_public(raw, fname):
    boundary = "----b" + uuid.uuid4().hex
    def part(n, v):
        return (f'--{boundary}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n').encode()
    body = part("is_private", "0") + part("folder", "Home") + part("file_name", fname)
    body += (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; '
             f'filename="{fname}"\r\nContent-Type: application/pdf\r\n\r\n').encode()
    body += raw + (f"\r\n--{boundary}--\r\n").encode()
    r = urllib.request.Request(ERP + "/api/method/upload_file", data=body, method="POST",
                               headers={"Authorization": TOK,
                                        "Content-Type": "multipart/form-data; boundary=" + boundary})
    return json.loads(urllib.request.urlopen(r, timeout=600).read())["message"]


def titleish(s):
    out = []
    for w in s.split():
        if w.lower() == "bc": out.append("BC")
        elif w.isupper(): out.append(w)
        elif re.match(r"^[A-Za-z]", w): out.append(w[0].upper() + w[1:])
        else: out.append(w)
    return " ".join(out)


def product_name(fn, particulars, type_id):
    s = re.sub(r"\.pdf$", "", fn, flags=re.I)
    if type_id == "spec":
        s = MOS_NOISE.sub("", s)
        s = re.sub(r"\broof\b", "Roof", s, flags=re.I)  # keep roof token
    s = re.sub(r"\s+", " ", s).strip(" -_")
    if not s or len(s) < 2:                       # fall back to particulars
        s = re.sub(r"\s+", " ", (particulars or "")).strip()
    return titleish(s)


def slug(s):
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-") or "doc"


def main():
    rows = json.load(open(DUMP, encoding="utf-8"))
    manifest = []
    if os.path.exists(OUT):
        manifest = json.load(open(OUT, encoding="utf-8"))
    done = {m["orig"] for m in manifest}
    used = {m["url"].rsplit("/", 1)[-1] for m in manifest}

    ok = skip = reuse = fail = 0
    for g, docs in rows:
        if g not in GROUPS:
            continue
        type_id, suffix = GROUPS[g]
        for particulars, file_url, fn in docs:
            if not file_url or file_url in done:
                skip += 1; continue
            name = product_name(fn, particulars, type_id)
            base = slug(name) + "-" + suffix
            fname = base + ".pdf"; n = 2
            while fname in used:
                fname = f"{base}-{n}.pdf"; n += 1
            used.add(fname)
            try:
                pub = exists_public(fname)
                if pub:
                    size = pub.get("file_size") or 0; reuse += 1
                    tag = "reuse"
                else:
                    raw = fetch(file_url)
                    res = upload_public(raw, fname)
                    size = res.get("file_size") or len(raw); ok += 1
                    tag = "up"
                manifest.append({
                    "type": type_id, "group": g, "product": name,
                    "particulars": particulars, "orig": file_url,
                    "url": "/files/" + fname, "size": size,
                })
                done.add(file_url)
                json.dump(manifest, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
                print(f"  {tag:5} {size//1024:5} KB  {fname}")
            except Exception as e:
                fail += 1
                print(f"  FAIL  {fn[:40]:40} {e}")
    print(f"\nuploaded {ok}, reused {reuse}, skipped {skip}, failed {fail}; manifest has {len(manifest)} docs")


if __name__ == "__main__":
    main()
