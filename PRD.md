# Product Requirements Document
## RCX Group — Brandscape Launch Pages

**Version:** 1.0
**Date:** 2026-03-15
**Prepared by:** RCX Group / Running Men

---

## 1. Overview

This document covers the static HTML page set built for the RCX Group website rebrand launch. These pages serve as the visual and structural reference for the WordPress implementation, and can also be used as standalone HTML embeds or WordPress page templates.

---

## 2. Pages Included

| File | Purpose |
|---|---|
| `h-home.html` | Homepage — hero, brand showcase, brand grid |
| `h-about-us.html` | About Us — core purpose, core values, leadership |
| `h-portfolio.html` | Portfolio — brand listing across Asia |
| `h-footer.html` | Shared footer component |
| `h-contact-us.html` | Full contact page — hero + info column + Web3Forms form |
| `h-contact-us.php` | WordPress template version of contact page |
| `h-contact-us-hero.html` | Hero section only — "Get In Touch" banner |
| `h-contact-us-info.html` | Contact info column only — office, phone, email, fax, map links |
| `h-join-us.html` | Careers / Join Us page — hero, intro, full application form |

---

## 3. Design System

### 3.1 Color Palette

| Variable | Hex | Usage |
|---|---|---|
| `--purple` | `#6750A1` | Accents, borders, icon backgrounds |
| `--purple-dk` | `#3E2A6E` | Hero backgrounds, dark sections |
| `--purple-lt` | `#F0ECF8` | Light purple tints |
| `--beige` | `#E8D0AA` | Primary accent, highlights, CTAs |
| `--beige-dk` | `#D2B679` | Hover states, darker beige |
| `--white` | `#ffffff` | Primary text on dark backgrounds |
| `--off-white` | `#F8F7F4` | Light section backgrounds |
| `--dark` | `#0E0E0E` | Main page background |
| `--dark-2` | `#1a1a1a` | Secondary dark surfaces |
| `--mid` | `#1A1A2E` | Mid-tone dark sections |

### 3.2 Typography

| Usage | Font | Size | Weight |
|---|---|---|---|
| Body / Base | Montserrat | 16px | 400 |
| Hero heading | Montserrat | clamp(3rem → 5.5rem) | 900 |
| Hero heading italic | Playfair Display | inherited | 700 italic |
| Section title | Montserrat | clamp(1.5rem → 2.5rem) | 800 |
| Eyebrow label | Montserrat | 10px | 700, uppercase, 0.25em spacing |
| Info label | Montserrat | 9–10px | 700, uppercase, 0.18em spacing |
| Info value / body | Montserrat | 14px | 400 |
| Form field label | Montserrat | 10px | 700, uppercase, 0.12em spacing |
| Form input text | Montserrat | 14px | 400 |
| Button | Montserrat | 13px | 700, uppercase, 0.1em spacing |

**Fonts loaded via:** Google Fonts CDN
`Montserrat` (300–900) + `Playfair Display` (700, 700 italic)

### 3.3 Spacing & Layout

- Max content width: `1200px`
- Standard section padding: `8rem 3rem` (desktop), `5rem 1.5rem` (mobile)
- Contact section grid: `1fr 1.4fr` (info : form), collapses to `1fr` at 900px
- Form field grid: `1fr 1fr` per row, collapses to `1fr` at 640px

---

## 4. Page Specifications

### 4.1 h-home.html

- **Hero:** Full-width dark background with background image overlay, brand statement headline, subtext
- **Removed:** "Est. 1995 · Malaysia · Singapore · Myanmar" eyebrow
- **Removed:** Specific number "15" from brand descriptions → replaced with "Iconic F&B brands" and "Our brands across Asia"
- **Brand Grid:** Showcases all F&B brands

### 4.2 h-about-us.html

- **Hero:** Background image — `Webpage-slide-Our-Core-Purpose.png` with dark overlay
- **Core Values:** Text-only cards, icons removed
- **Colors:** Uses `--beige` / `--beige-dk` variables throughout

### 4.3 h-portfolio.html

- **Brand showcase** with filtering or grid layout
- Uses `--beige` / `--beige-lt` variables (note: this file uses `--orange-lt` which remains as-is)

### 4.4 h-footer.html

- Shared footer component
- Uses `--beige` variable for accent colors
- Standalone embeddable component

### 4.5 h-contact-us.html

- **Hero section:** Purple-dk background with radial gradient glows, "Get In Touch" heading
- **Two-column layout:** Contact info (left) + Web3Forms form (right)
- **Contact info:** Head Office, Telephone, Email, Fax, Google Maps + Waze buttons
- **Form:** Web3Forms integration (free tier, 250 submissions/month)

#### Form Configuration

| Field | Value |
|---|---|
| Action | `https://api.web3forms.com/submit` |
| Access Key | `03b0ef70-f50e-48a9-8009-c7212bf0b2dd` |
| Subject | `RCX_Contact Us (Name)` — name appended dynamically via JS |
| From Name | `RCX Group Website` |
| CC Recipients | `developer@runningmen.my`, `andrew@runningmen.my`, `K.jiaying25+1@gmail.com`, `info@rcxgroup.com` |
| Spam Protection | Honeypot `botcheck` hidden checkbox |

#### Form Fields

| Field | Type | Required |
|---|---|---|
| Name | Text | Yes |
| Email | Email | Yes |
| Contact No. | Tel | No |
| Subject | Text | Yes |
| Message | Textarea | Yes |

### 4.6 h-contact-us.php

- WordPress page template version of the contact page
- Template name: `RCX Contact Us`
- Uses `wp_head()`, `wp_footer()`, `body_class()`
- Form: Web3Forms HTML form (same as h-contact-us.html)
- **To deploy:** Upload to active WordPress theme folder → assign "RCX Contact Us" template to the Contact Us page

### 4.7 h-contact-us-hero.html

- Standalone hero section only
- Purple-dk background with beige radial glow effects
- Eyebrow: "Reach Out"
- Heading: "Get *In Touch*" (italic in Playfair Display)
- Subtext: "We'd love to hear from you..."
- Includes scroll reveal animation script

### 4.8 h-contact-us-info.html

- Standalone contact info block only
- Left-aligned layout
- Includes: Head Office, Telephone, Email, Fax
- Google Maps + Waze pill buttons
- Includes "We'd Love to Hear from You" heading with Playfair italic span

### 4.9 h-join-us.html

- **Hero section:** Purple-dk background, eyebrow "Careers", heading "Join *Our Team*"
- **Intro section:** "Work With Purpose" / "Why Join RCX?" with 3 value proposition cards
- **Application Form:** Web3Forms integration

#### Form Configuration

| Field | Value |
|---|---|
| Action | `https://api.web3forms.com/submit` |
| Access Key | `03b0ef70-f50e-48a9-8009-c7212bf0b2dd` |
| Subject | `RCX_Join Us Application (First Last)` — names appended dynamically via JS |
| From Name | `RCX Group Website` |
| CC Recipients | `developer@runningmen.my`, `andrew@runningmen.my`, `K.jiaying25+1@gmail.com`, `info@rcxgroup.com` |
| Spam Protection | Honeypot `botcheck` hidden checkbox |

#### Form Fields

| Field | Type | Required |
|---|---|---|
| First Name | Text | Yes |
| Last Name | Text | Yes |
| Email Address | Email | Yes |
| Contact No. | Tel | No |
| Date of Birth | Date | No |
| City | Text | No |
| Country | Text | No |
| LinkedIn Profile | URL | No |
| Highest Education | Checkboxes (SPM / Diploma / Degree / Others) | No |
| Years of Experience | Checkboxes (12 options: F&B, retail, marketing, etc.) | No |
| Position of Interest | Text | No |
| Message | Textarea | No |
| Resume / CV | File Upload | No |

---

## 5. Animations

All pages use `IntersectionObserver` for scroll reveal:

```javascript
.reveal          — opacity 0 → 1, translateY 28px → 0, 0.7s ease
.reveal-delay-1  — 0.1s delay
.reveal-delay-2  — 0.2s delay
.reveal-delay-3  — 0.3s delay
```

Threshold: `0.08` | Root margin: `0px 0px -40px 0px`

---

## 6. Assets

### 6.1 Fonts (local, `/fonts/`)
- `Gotham Bold.woff2`
- `Gotham Book.woff2`
- `Gotham Medium Regular.woff2`

> Note: Pages currently load Montserrat via Google Fonts CDN. Gotham files are available locally for future use.

### 6.2 Images (`/images/`)

| Folder | Contents |
|---|---|
| `images/hero/` | Page hero background images (Webpage slide-*.png) |
| `images/brands/` | Individual brand folders with brand assets |
| `images/logos/` | RCX Group logo variants (black bg, white bg, horizontal, vertical) |
| `images/awards/` | Brand award images |

### 6.3 Other Assets
- `favicon.ico` — site favicon
- `sitemap.xml` — XML sitemap for SEO
- `robots.txt` — crawler instructions

---

## 7. Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| > 900px | Full two-column layout (contact section) |
| ≤ 900px | Single column, stacked layout |
| ≤ 640px | Reduced hero padding, form rows stack to single column |

---

## 8. Third-Party Integrations

| Service | Usage | Notes |
|---|---|---|
| Web3Forms | Contact form submission | Free tier: 250/month. Access key stored in hidden field. |
| Google Fonts | Montserrat + Playfair Display | Loaded via CDN link tag |
| Google Maps | Map button on contact page | Links to office address query |
| Waze | Map button on contact page | Links to SetiaWalk Puchong |

---

## 9. WordPress Deployment Notes

- `h-contact-us.php` → upload to `/wp-content/themes/[active-theme]/`
- Assign template via WordPress admin: Pages → Contact Us → Page Attributes → Template: "RCX Contact Us"
- Web3Forms works natively in HTML — no WordPress plugin required
- For other pages: content can be pasted into Kadence blocks using the HTML/Custom HTML block

---

## 10. Known Considerations

- The `.html` files may have `<!DOCTYPE html>` and `<head>`/`<body>` tags stripped by some linters — this is cosmetic only and does not affect functionality when embedded in WordPress
- The `cc` field in Web3Forms sends copies to all 4 recipients simultaneously — verify this works on the free tier once live
- `h-portfolio.html` uses `--orange-lt` variable (not renamed) — intentional, separate variable from `--beige`/`--beige-dk`
