# Dev Progress Summary

RCX Group is a static site with 20 routes, live at `https://rcx-website.vercel.app/`. Build with `python3 build_site.py`; serve with `python3 -m http.server 8000`. The 14 brand profiles share `brand-data.json`, `brand_pages.py`, `brands.css`, and `brands.js`. Main-page heroes use 80px desktop/45px mobile headings and 16px paragraphs, with fluid tablet sizes. Brand heroes omit location lines beneath the name; Find us retains locations. Brand descriptions use a uniform 1rem text style. Stories/awards display fully; socials sit below story headings; secondary navigation and Keep exploring are removed; Find us is purple. Responsive layouts pass Chrome/WebKit at 320–2560px. Portfolio links directly to its overview, with a separate brand dropdown. Motion uses slower hero/section entrances, quick control feedback, and native page crossfades; reduced-motion remains static. Shared footer uses `h-footer.html`, `footer.css`, `footer-data.json`; group social/legal URLs remain pending. Shared forms use `forms.py`, `forms.css`, `site.js`; delivery remains untested and QA uses mocks. Publuu works. Only supplied Gotham Medium is valid. Deployment is direct from local files; GitHub main tracks the current site. Live image references use matching WebP assets with display settings preserved. Next: News/articles, Contact hero, careers file upload, and live form delivery verification.

# Recent Work (last 3 dates)

## 2026-11-19

- Prepared the deployed WebP version for synchronization to the RCX-Page GitHub repository.

## 2026-11-18

- Replaced local photo and logo references with matching WebP files, retained portfolio logo mapping and display styles, and rebuilt all 20 routes. Verified 167 original/WebP pairs load with matching dimensions. Staged and promoted `dpl_5JptVQCPDPwzYEmEaLa13e9U83dc`; all 20 live pages matched the tested build and 40 mobile/desktop layout checks passed.

## 2026-11-16

- Corrected Portfolio hero to bold Gotham (weight 900), preserving italic Georgia for “Purpose.” and existing sizes. Chrome/WebKit passed 14 local and four public checks; actual rendered fonts confirmed. Staged HTML matched; promoted `dpl_Bcq16ty6Nc5QvXGFFxbawFDGn3BJ`. Evidence: `output/playwright/portfolio-hero-font-live.json`.

- Standardized the six main-page hero headings to 80px at 1024px+, 45px at 640px and below, and fluid tablet sizes; paragraphs use 16px throughout. Brand profiles are excluded. Chrome/WebKit passed 84 main-page and 56 unchanged-brand checks with no overflow/errors. Staged stylesheet matched; promoted `dpl_4ZXvVTWQaokaBfia671wbFqBf5xC`. All 24 public Chrome/WebKit checks passed. Evidence: `output/playwright/main-hero-type-live.json`.

- Removed the region/location line beneath each of the 14 brand hero names through the shared template and deleted its styling. Region/venue details remain in Find us. Chrome/WebKit passed 56 mobile/desktop checks with no overflow. Staged HTML matched the tested build; promoted `dpl_7ndGBX1AtB8AtgeJpQTTKeGW1csE`. All 14 public pages passed with Find us preserved and no script errors. Evidence: `output/playwright/brand-hero-without-location-live.json`.

- Standardized all 14 brand story descriptions at 1rem/16px with shared line height/colour; removed enlarged opening and mobile lead overrides. Headings, taglines, copy and paragraph breaks are preserved. Chrome/WebKit passed 84 checks at 320/768/1440px. Promoted `dpl_84YBQM7szRKGpd4EtLg36po9Yqfq` after staged CSS matched the tested file. All 28 public mobile/desktop checks passed without errors. Evidence: `output/playwright/brand-description-uniform-live.json`.

- Made Portfolio a direct `/portfolio/` link with a separate accessible 44px dropdown arrow; removed All brands and retained 14 brand destinations. Added current-route states and reliable Escape/outside-click/link dismissal. Menus open immediately.
- Diagnosed abrupt navigation as full HTML replacement without visual continuity, combined with short entrances. Added a 240ms native document crossfade with stable header and reduced-motion opt-out. Inline head opt-in fixes Chrome's cold-stylesheet race without intercepting links or delaying navigation. Preloaded the valid Gotham font. Slowed hero headlines to 680ms desktop/600ms mobile, supporting text to 560/520ms plus 80ms delay, and scroll entrances to 560/500ms with gentler easing.
- Fixed previously suppressed built hero motion by separating load entrances from scroll reveals. Earlier navigation release `dpl_97ZhGfZ4L38gBqFAXFgNBzsYKLSR` passed public Chrome/WebKit navigation and actual moving-frame checks. Evidence: `output/playwright/navigation-release-2026-11-16.json`.
