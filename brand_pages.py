"""Render RCX brand profiles from the reviewed reference content."""

from html import escape as e
from urllib.parse import quote, quote_plus
import json

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'
SOCIAL_ICONS = {
    "Facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    "Instagram": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/>',
    "Website": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18z"/>',
}


def social_links(brand):
    links = []
    for link in brand["socials"]:
        label = f'{brand["name"]} {link["label"]} (opens in a new tab)'
        icon = SOCIAL_ICONS[link["label"]]
        links.append(f'<a href="{e(link["href"], quote=True)}" target="_blank" rel="noopener noreferrer" '
                     f'aria-label="{e(label, quote=True)}" title="{e(link["label"], quote=True)}">'
                     f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{icon}</svg></a>')
    return f'<nav class="brand-socials" aria-label="{e(brand["name"], quote=True)} online">' + ''.join(links) + '</nav>' if links else ''


def asset(path):
    return quote(path, safe="/")


def external(link, brand=""):
    label = "Google Maps" if link["label"] == "Google Map" else link["label"]
    href = link["href"]
    if href.startswith("tel:"):
        return f'<a href="{e(href, quote=True)}">{e(label)}</a>'
    return (f'<a href="{e(href, quote=True)}" target="_blank" rel="noopener noreferrer" '
            f'aria-label="{e((brand + " " + label).strip(), quote=True)} (opens in a new tab)">{e(label)}<span aria-hidden="true">↗</span></a>')


def venue_body(venue):
    maps = [link for link in venue["links"] if not link["href"].startswith("tel:")]
    phones = [link for link in venue["links"] if link["href"].startswith("tel:")]
    if not any("google.com/maps" in link["href"] for link in maps):
        maps.insert(0, {"label": "Google Maps", "href": "https://www.google.com/maps/search/?api=1&query=" + quote_plus(venue["name"] + " " + venue["address"])})
    return (f'<div class="brand-venue__body"><address>{e(venue["address"])}</address>'
            + ('<div class="brand-venue__phones"><span>Call</span>' + ''.join(external(link) for link in phones) + '</div>' if phones else '')
            + '<div class="brand-venue__directions">' + ''.join(external(link, venue["name"]) for link in maps) + '</div></div>')


def render_brand(brand):
    name = brand["name"]
    gallery = [{"src": asset(path), "alt": f'{name}, gallery photograph {i + 1}'} for i, path in enumerate(brand["gallery"])]
    story = f'<p class="brand-story__lead">{e(brand["story"][0])}</p>'
    story += ''.join(f'<p class="brand-story__paragraph">{e(p)}</p>' for p in brand["story"][1:])
    if brand["awards"]:
        story += ('<section class="brand-awards" aria-labelledby="brand-awards-heading"><h3 id="brand-awards-heading">Awards &amp; recognition</h3><dl>'
                  + ''.join('<div><dt>' + e(group["year"]) + '</dt><dd><ul>'
                            + ''.join(f'<li>{e(item)}</li>' for item in group["items"]) + '</ul></dd></div>' for group in brand["awards"])
                  + '</dl></section>')
    venues = ''
    for i, venue in enumerate(brand["venues"]):
        if len(brand["venues"]) > 2:
            venues += (f'<details class="brand-venue"{" open" if i == 0 else ""}><summary><h3>{e(venue["name"])}</h3></summary>'
                       + venue_body(venue) + '</details>')
        else:
            venues += f'<article class="brand-venue"><h3>{e(venue["name"])}</h3>' + venue_body(venue) + '</article>'
    gallery_html = ''.join(
        f'<button class="brand-gallery__photo" type="button" data-brand-photo="{i}" aria-label="Open photograph {i+1} of {len(gallery)} for {e(name, quote=True)}">'
        f'<img src="{photo["src"]}" alt="" loading="lazy" width="900" height="700"><span aria-hidden="true">↗</span></button>'
        for i, photo in enumerate(gallery[:6])
    )
    gallery_json = json.dumps(gallery, ensure_ascii=False).replace('<', '\\u003c')
    social = social_links(brand)
    return f'''<article class="rcx-brand">
<section class="brand-hero" aria-labelledby="brand-title">
    <img class="brand-hero__photo" src="{asset(brand['hero'])}" alt="" fetchpriority="high" style="object-position:{e(brand['hero_position'], quote=True)}">
    <div class="brand-shell brand-hero__inner">
        <div class="brand-hero__top">
            <nav class="brand-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/portfolio/">Portfolio</a></li><li aria-current="page">{e(name)}</li></ol></nav>
            <img class="brand-hero__logo" src="{asset(brand['logo'])}" alt="{e(name, quote=True)} logo" width="132" height="132">
        </div>
        <div class="brand-hero__content">
            <p class="brand-hero__category">{e(brand['category'])}</p>
            <h1 id="brand-title">{e(name)}</h1>
            <div class="brand-hero__actions"><a class="brand-button brand-button--beige" href="#visit">Visit us {ARROW}</a><a class="brand-hero__gallery-link" href="#gallery">Explore gallery</a></div>
        </div>
    </div>
</section>
<section class="brand-story brand-section" id="story" aria-labelledby="story-heading"><div class="brand-shell brand-story__inner">
    <div class="brand-story__identity"><p class="brand-label">The brand</p><h2 id="story-heading">{e(brand['story_heading'])}</h2>{social}</div>
    <div class="brand-story__copy">{story}</div>
</div></section>
<section class="brand-gallery brand-section" id="gallery" aria-labelledby="gallery-heading"><div class="brand-shell">
    <div class="brand-section__header"><h2 id="gallery-heading">Inside {e(name)}</h2><button class="brand-text-link" type="button" data-brand-photo="0">{'View photo' if len(gallery)==1 else f'View all {len(gallery)} photos'} {ARROW}</button></div>
    <div class="brand-gallery__grid{' brand-gallery__grid--single' if len(gallery)==1 else ''}">{gallery_html}</div>
</div></section>
<section class="brand-visit brand-section" id="visit" aria-labelledby="visit-heading"><div class="brand-shell brand-visit__inner">
    <div class="brand-visit__intro"><p class="brand-label">Find us</p><h2 id="visit-heading">Come on <em>over.</em></h2><p>{e(brand['region'])}</p><p class="brand-visit__count">{len(brand['venues'])} {'location' if len(brand['venues'])==1 else 'locations'}</p></div>
    <div class="brand-visit__venues">{venues}</div>
</div></section>
<dialog class="brand-lightbox" aria-labelledby="brand-gallery-title">
    <div class="brand-lightbox__bar"><h2 id="brand-gallery-title">{e(name)} gallery</h2><button type="button" data-brand-close aria-label="Close gallery" autofocus>×</button></div>
    <figure><img data-brand-enlarged alt=""><figcaption><span data-brand-counter aria-live="polite"></span><span>Use arrow keys to browse</span></figcaption></figure>
    <div class="brand-lightbox__controls"><button type="button" data-brand-previous aria-label="Previous photograph">← Previous</button><button type="button" data-brand-next aria-label="Next photograph">Next →</button></div>
</dialog>
<script type="application/json" id="brand-gallery-data">{gallery_json}</script>
</article>'''
