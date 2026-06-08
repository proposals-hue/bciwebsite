"""
Download + compress the ERP product photos referenced by image_manifest.json
into assets/products/ as small, lazy-loadable web JPEGs.

Run after build_products.py:  python tools/fetch_images.py
"""
import json, os, io, urllib.request, urllib.parse
from PIL import Image, ImageOps

HERE = os.path.dirname(__file__)
ROOT = os.path.dirname(HERE)
MANIFEST = os.path.join(HERE, "image_manifest.json")
OUTDIR = os.path.join(ROOT, "assets", "products")
ERP = "https://apcv14.lynx.sa"
# ERP API token — set ERP_TOKEN in your environment ("token <key>:<secret>").
HEADERS = {"Authorization": os.environ["ERP_TOKEN"]} if os.environ.get("ERP_TOKEN") else {}
MAXW = 720       # max width — product cards render ~520px wide on desktop
QUALITY = 72

os.makedirs(OUTDIR, exist_ok=True)

def fetch(src):
    url = ERP + urllib.parse.quote(src)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read()

def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    ok = fail = skipped = 0
    total_bytes = 0
    failures = []
    for src, fn in manifest.items():
        out = os.path.join(OUTDIR, fn)
        if os.path.exists(out):
            skipped += 1; total_bytes += os.path.getsize(out); continue
        try:
            raw = fetch(src)
            im = Image.open(io.BytesIO(raw))
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > MAXW:
                im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
            im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            sz = os.path.getsize(out); total_bytes += sz; ok += 1
            print(f"  ok  {fn:42} {sz//1024:4} KB")
        except Exception as e:
            fail += 1; failures.append((fn, src, str(e)))
            print(f"  FAIL {fn:41} {e}")
    print(f"\ndownloaded {ok}, skipped {skipped}, failed {fail}")
    print(f"total assets size: {total_bytes/1024/1024:.1f} MB across {ok+skipped} files")
    if failures:
        json.dump(failures, open(os.path.join(HERE, "image_failures.json"), "w"),
                  ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
