"""Package the generated RCX site as Vercel Build Output API static files."""

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / ".vercel" / "output"
STATIC = OUTPUT / "static"

if STATIC.exists():
    shutil.rmtree(STATIC)
STATIC.mkdir(parents=True)

for name in ("index.html", "site.css", "footer.css", "forms.css", "brands.css", "brands.js", "site.js", "motion.css", "motion.js", "favicon.ico", "robots.txt", "sitemap.xml"):
    shutil.copy2(ROOT / name, STATIC / name)

for name in ("about-us", "contact-us", "join-us", "news", "portfolio", "images"):
    shutil.copytree(ROOT / name, STATIC / name)

(STATIC / "fonts").mkdir()
shutil.copy2(ROOT / "fonts" / "Gotham Medium Regular.woff2", STATIC / "fonts" / "Gotham Medium Regular.woff2")

(OUTPUT / "config.json").write_text(json.dumps({"version": 3}) + "\n")
print(f"Prepared {sum(path.is_file() for path in STATIC.rglob('*'))} static files in {STATIC}")
