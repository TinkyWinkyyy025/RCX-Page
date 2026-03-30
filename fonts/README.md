# Custom Fonts

## How to Add Font Files

Place your custom font files in this folder. Supported formats:
- `.woff2` (recommended - best compression)
- `.woff` (fallback)
- `.ttf` / `.otf` (if needed)

## Example Structure

```
public/fonts/
├── Gotham-Bold.woff2
├── Gotham-Bold.woff
├── Gotham-Medium.woff2
├── Gotham-Medium.woff
├── Gotham-Book.woff2
├── Gotham-Book.woff
└── README.md
```

## Font Weights Reference

- **Book/Regular**: `font-weight: 400`
- **Medium**: `font-weight: 500`
- **Bold**: `font-weight: 700`

## Already Configured

The following fonts are already configured in `src/index.css`:
- Gotham Bold (700)
- Gotham Medium (500)
- Gotham Book (400)

If you have different font files, update the `@font-face` declarations in `src/index.css` to match your actual file names.

## Font Conversion Tool

If you need to convert fonts to `.woff2`:
- https://cloudconvert.com/ttf-to-woff2
- https://everythingfonts.com/font-face

## Usage in Code

The fonts are automatically applied through Tailwind classes:
- `font-heading` - Uses Gotham for headings
- `font-body` - Uses Gotham for body text

Example:
```tsx
<h1 className="font-heading font-bold">Heading Text</h1>
<p className="font-body">Body text</p>
```
