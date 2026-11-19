"""Build the browsable RCX site from the supplied WordPress section exports."""

from pathlib import Path
from urllib.parse import unquote, urlparse
import html
import json
import re
from datetime import date
from string import Template
from forms import contact_form, careers_form
from brand_pages import render_brand

ROOT = Path(__file__).resolve().parent
STAGING = "https://rcxgroup.wpcomstaging.com"
LOGO = "/images/logos/RCX fit.webp"
FOOTER_LOGO = "/images/logos/OTHERS-25-037_RCX Rebrand-OL-Logo 2_Horizontal-White.webp"
IMAGE_MAP = {
    "Webpage-slide-Home-Empty.png": "/images/hero/home-clean.webp",
    "Webpage-slide-Our-Core-Purpose.png": "/images/hero/Webpage slide-Our Core Purpose.webp",
    "Webpage-slide-Taste-n-ID.png": "/images/hero/Webpage slide-Taste n ID.webp",
    "Webpage-slide-Job-Openings.png": "/images/hero/Webpage slide-Job Openings.webp",
    "Webpage-slide-Get-in-Touch.png": "/images/hero/Webpage slide-Connect.webp",
    "Webpage-slide-News-n-Updates-3.png": "/images/hero/Webpage slide-News n Updates 1.webp",
    "RCX-fit.png": "/images/logos/RCX fit.webp",
    "cropped-OTHERS-25-037_RCX-Rebrand-OL-Logo-1_OR.png": FOOTER_LOGO,
    "CommonSpace_logo.png": "/images/brands/common-space/logo.webp",
    "DancingFish_logo.png": "/images/brands/dancing-fish/logo.webp",
    "Fangkong_logo.png": "/images/brands/fang-kong/logo.webp",
    "Paperkite_logo.png": "/images/brands/paperkite-chicken-beer/logo.webp",
    "Picaro_logo.png": "/images/brands/picaro/logo.webp",
    "TheRabbitHole_logo.png": "/images/brands/the-rabbit-hole/logo.webp",
    "RamaV_logo.png": "/images/brands/rama-v/logo.webp",
    "Suzie-Wong_logo-new.webp": "/images/brands/suzie-wong/logo.webp",
    "Taproom_logo.png": "/images/brands/tap-room/logo.webp",
    "Taptap_logo.png": "/images/brands/tap-tap/logo.webp",
    "TBF_logo.png": "/images/brands/the-beer-factory/logo.webp",
    "ThaiHouSek_logo.png": "/images/brands/thai-hou-sek/logo.webp",
    "TheAttic_logo.png": "/images/brands/the-attic/logo.webp",
    "Untitled-design.png": "/images/brands/tono-izakaya/logo.webp",
}

PORTFOLIO_LOGOS = {
    "common-space": "CommonSpace_logo.webp",
    "dancing-fish": "DancingFish_logo.webp",
    "fang-kong": "Fangkong_logo.webp",
    "paperkite-chicken-beer": "Paperkite_logo.webp",
    "picaro": "Picaro_logo.webp",
    "the-rabbit-hole": "TheRabbitHole_logo.webp",
    "rama-v": "RamaV_logo.webp",
    "suzie-wong": "Suzie-Wong_logo-new.webp",
    "tap-room": "Taproom_logo.webp",
    "tap-tap": "Taptap_logo.webp",
    "the-beer-factory": "TBF_logo.webp",
    "thai-hou-sek": "ThaiHouSek_logo.webp",
    "the-attic": "TheAttic_logo.webp",
    "tono-izakaya": "Tono_logo.webp",
}

BRANDS = [
    ("common-space", "Common Space", "Mini food hall"),
    ("dancing-fish", "Dancing Fish", "Indonesian dining with a Malaysian heart"),
    ("fangkong", "Fang Kong", "Contemporary Chinese dining"),
    ("paperkite-chicken-beer", "Paperkite Chicken & Beer", "Chicken and beer, made to share"),
    ("picaro", "PICARO", "Spanish tapas & bar"),
    ("the-rabbit-hole", "The Rabbit Hole", "Café, bar and rooftop wellness hub"),
    ("rama-v", "Rama V", "Fine Thai dining since 1995"),
    ("suzie-wong", "Suzie Wong", "Modern Chinese tapas & supper club"),
    ("tap-room", "Tap Room", "Craft beer microbrewery experience"),
    ("tap-tap", "TAP TAP", "Cocktails on tap"),
    ("the-beer-factory", "The Beer Factory", "Industrial factory themed bar"),
    ("thai-hou-sek", "Thai Hou Sek", "Thai Chinese comfort food"),
    ("the-attic", "The Attic", "Dance club in Yangon"),
    ("tono-izakaya", "Tono Izakaya", "Japanese izakaya in Singapore"),
]


def localize(source: str) -> str:
    # The shared motion controller owns entrances; exported reveal classes would
    # otherwise leave a second observer changing animation state mid-entrance.
    def clean_motion_classes(match):
        names = [name for name in match[1].split()
                 if name != "reveal" and not re.fullmatch(r"reveal-delay-\d+", name)]
        return 'class="' + ' '.join(names) + '"'

    source = re.sub(r'class="([^"]*)"', clean_motion_classes, source)
    source = re.sub(r'<link[^>]+fonts\.googleapis\.com[^>]*>', '', source)
    source = re.sub(r"@import\s+url\(\s*(['\"])https://fonts\.googleapis\.com.*?\1\s*\)\s*;", "", source, flags=re.S)

    def replace_upload(match):
        url = match.group(0)
        filename = unquote(urlparse(url).path.rsplit("/", 1)[-1])
        return IMAGE_MAP.get(filename, url)

    source = re.sub(r'https://rcxgroup\.wpcomstaging\.com/wp-content/uploads/[^\s"\x27)<>]+', replace_upload, source)
    source = source.replace(f'{STAGING}/join-us/', '/join-us/')
    source = source.replace(f'{STAGING}/portfolio/', '/portfolio/')
    source = source.replace('href="/contact"', 'href="/contact-us/"')
    source = source.replace('href="/careers"', 'href="/join-us/"')
    source = source.replace('href="/about-us"', 'href="/about-us/"')
    source = source.replace('href="/news"', 'href="/news/"')
    source = source.replace('href="/portfolio"', 'href="/portfolio/"')
    source = source.replace('href="/contact-us"', 'href="/contact-us/"')
    return source


def split_export(filename: str):
    source = localize((ROOT / filename).read_text())
    split = source.find("</style>")
    if split == -1:
        raise ValueError(f"No style block in {filename}")
    split += len("</style>")
    head, body = source[:split], source[split:]
    head = re.sub(r'<meta\s+charset=[^>]+>', '', head, flags=re.I)
    head = re.sub(r'<meta\s+name="viewport"[^>]+>', '', head, flags=re.I)
    head = re.sub(r'<title>.*?</title>', '', head, flags=re.I | re.S)
    return head, body


def render_footer() -> str:
    data = json.loads((ROOT / "footer-data.json").read_text())

    def links(items):
        result = []
        for item in items:
            if not item["href"] or item["href"] == "#":
                raise ValueError(f"Footer link needs a destination: {item['label']}")
            result.append(f'<a href="{html.escape(item["href"], quote=True)}">{html.escape(item["label"])}</a>')
        return result

    navigation = ''.join(
        f'<nav aria-label="{html.escape(group["label"], quote=True)}">'
        f'<h2 class="rcx-footer__title">{html.escape(group["label"])}</h2>'
        '<ul class="rcx-footer__links">' + ''.join(f'<li>{link}</li>' for link in links(group["links"])) + '</ul></nav>'
        for group in data["navigation"]
    )
    contacts = []
    for contact in data["contacts"]:
        value = '<br>'.join(html.escape(line) for line in contact["lines"])
        if contact.get("href"):
            value = f'<a href="{html.escape(contact["href"], quote=True)}">{value}</a>'
        if contact.get("address"):
            value = f'<address>{value}</address>'
        contacts.append(f'<div class="rcx-footer__contact"><dt>{html.escape(contact["label"])}</dt><dd>{value}</dd></div>')
    socials = '<nav class="rcx-footer__socials" aria-label="Social media">' + ''.join(links(data["socials"])) + '</nav>' if data["socials"] else ''
    legal = '<nav class="rcx-footer__legal" aria-label="Legal">' + ''.join(links(data["legal"])) + '</nav>' if data["legal"] else ''
    return Template((ROOT / "h-footer.html").read_text()).substitute(
        logo=html.escape(data["logo"], quote=True), navigation=navigation,
        contacts=''.join(contacts), socials=socials, legal=legal,
        year=date.today().year, company=html.escape(data["company"]),
        registration=html.escape(data["registration"]),
    )


footer_html = render_footer()


def header(active: str, route: str = "") -> str:
    links = [("Home", "/", "home"), ("About Us", "/about-us/", "about"),
             ("Join us", "/join-us/", "join"), ("Contact Us", "/contact-us/", "contact"),
             ("News & Updates", "/news/", "news")]
    nav = []
    for label, href, key in links:
        if key == "about":
            current = ' aria-current="page"' if route == "portfolio" else ''
            nav.append('<div class="nav-drop nav-portfolio' + (' is-active' if active == 'portfolio' else '') + '">'
                       f'<a class="nav-portfolio__link" href="/portfolio/"{current}>Portfolio</a>'
                       '<button class="portfolio-toggle" type="button" aria-label="Browse portfolio brands" aria-expanded="false" aria-controls="nav-brand-list">'
                       '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg></button>'
                       '<div class="nav-menu" id="nav-brand-list" hidden>' + ''.join(
                           f'<a href="/portfolio/{slug}/"' + (' aria-current="page"' if route == f'portfolio/{slug}' else '') + f'>{html.escape(name)}</a>' for slug, name, _ in BRANDS
                       ) + '</div></div>')
        nav.append(f'<a href="{href}"' + (' aria-current="page"' if key == active else '') + f'>{label}</a>')
    return ('<a class="skip-link" href="#main">Skip to content</a>'
            '<header class="site-header"><div class="site-header-inner">'
            f'<a class="site-logo" href="/" aria-label="RCX Group home"><img src="{LOGO}" alt="RCX Group"></a>'
            '<button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">'
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>'
            '<nav id="site-nav" class="site-nav" aria-label="Main navigation">' + ''.join(nav) + '</nav>'
            '</div></header>')


def document(title: str, content: str, active: str, head: str = "", route: str = "") -> str:
    form_styles = '<link rel="stylesheet" href="/forms.css">' if active in ("contact", "join") else ''
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            '<style>@view-transition{navigation:auto}@media(prefers-reduced-motion:reduce),print{@view-transition{navigation:none}}</style>'
            f'<title>{html.escape(title)}</title><link rel="preload" href="/fonts/Gotham%20Medium%20Regular.woff2" as="font" type="font/woff2" crossorigin><noscript><style>.portfolio-toggle{{display:none!important}}</style></noscript>{head}'
            f'<link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/footer.css">{form_styles}<link rel="stylesheet" href="/motion.css"></head><body>'
            f'{header(active, route)}<main id="main" class="site-main">{content}</main>'
            f'{footer_html}<script src="/site.js" defer></script><script src="/motion.js" defer></script></body></html>')


def write_route(route: str, content: str):
    path = ROOT / route / "index.html" if route else ROOT / "index.html"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    print(path.relative_to(ROOT))


for route, export, title, active in [
    ("", "h-home.html", "RCX Group | Hospitality across Asia", "home"),
    ("about-us", "h-about-us.html", "About Us | RCX Group", "about"),
    ("portfolio", "h-portfolio.html", "Portfolio | RCX Group", "portfolio"),
    ("join-us", "h-join-us.html", "Join Us | RCX Group", "join"),
    ("contact-us", "h-contact-us.html", "Contact Us | RCX Group", "contact"),
    ("news", "h-news.html", "News & Updates | RCX Group", "news"),
]:
    head, body = split_export(export)
    if route == "portfolio":
        for slug, filename in PORTFOLIO_LOGOS.items():
            old = f'/images/brands/{slug}/logo.webp'
            new = f'/images/brands/{slug}/{filename}'
            if body.count(f'src="{old}"') != 1 or not (ROOT / new.lstrip('/')).is_file():
                raise ValueError(f"Portfolio logo missing or ambiguous: {slug}")
            body = body.replace(f'src="{old}"', f'src="{new}"')
    if route == "contact-us":
        body, count = re.subn(r'<form class="contact-form".*?</form>', lambda _: contact_form(), body, flags=re.S)
        if count != 1:
            raise ValueError("Contact form template missing or ambiguous")
    if route == "join-us":
        body += careers_form()
        body = body.replace('<div class="job-card-header" onclick="toggleJob(this)">',
                            '<button class="job-card-header" type="button" onclick="toggleJob(this)" aria-expanded="false">')
        body = body.replace('</svg>\n            </div>\n            <div class="job-card-body">', '</svg>\n            </button>\n            <div class="job-card-body">')
    if route == "news":
        articles = [
            ("First Classe", "January 14, 2026", "RCX founder Kent Chua shares his view of success and the journey behind the group.", "/images/brands/rama-v/NR9A7309.webp"),
            ("Focus Malaysia – Cover Story", "January 14, 2026", "A look at the vision, mission and core values driving RCX forward.", "/images/brands/the-rabbit-hole/hero.webp"),
            ("We are now Rhombus Connexion", "January 14, 2026", "A new chapter for the group and the people behind its hospitality brands.", "/images/hero/Webpage slide-Our Core Purpose.webp"),
        ]
        body += '<section class="news-list" aria-label="Latest stories">' + ''.join(
            f'<article class="news-card"><img src="{image}" alt=""><div class="news-card-body">'
            f'<h2>{html.escape(name)}</h2><small>{date}</small><p>{html.escape(copy)}</p></div></article>'
            for name, date, copy, image in articles) + '</section>'
    write_route(route, document(title, body, active, head, route))


brand_data = json.loads((ROOT / "brand-data.json").read_text())
for slug, name, _ in BRANDS:
    brand = brand_data[slug]
    for asset_path in [brand["hero"], brand["logo"], *brand["gallery"]]:
        if not (ROOT / asset_path.lstrip('/')).is_file():
            raise ValueError(f"Missing brand asset: {asset_path}")
    content = render_brand(brand)
    head = ('<link rel="stylesheet" href="/brands.css"><script src="/brands.js" defer></script>'
            f'<meta name="description" content="{html.escape(brand["story"][0][:155], quote=True)}">')
    write_route(f"portfolio/{slug}", document(f"{name} | RCX Portfolio", content, "portfolio", head, f"portfolio/{slug}"))
