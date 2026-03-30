# Images Folder

## 📁 How to Add Your Photos

### 1. For Brand Images
Place brand photos in the respective brand folder:

```
public/images/brands/
├── bushido/
│   ├── hero.jpg          (main brand image)
│   ├── logo.png          (transparent logo)
│   ├── interior-1.jpg    (restaurant interior)
│   ├── dish-1.jpg        (signature dishes)
│   └── ...
├── dancing-fish/
│   ├── hero.jpg
│   ├── logo.png
│   └── ...
└── [repeat for all 15 brands]
```

### 2. For Homepage Hero Images
```
public/images/hero/
├── homepage-hero.jpg     (main hero background)
├── about-hero.jpg        (about page hero)
└── contact-hero.jpg      (contact page hero)
```

### 3. For RCX Group Logos
```
public/images/logos/
├── rcx-logo-white.png    (for dark backgrounds)
├── rcx-logo-color.png    (for light backgrounds)
└── rcx-logo-icon.png     (favicon/small sizes)
```

### 4. For Awards and Recognition Logos
```
public/images/awards/
├── michelin-guide.png
├── cnn-travel.png
├── time-out.png
├── hapa-awards.png
└── heineken-champion.png
```

## 🎯 Quick Tips

1. **File Naming**: Use lowercase with hyphens (kebab-case)
   - ✅ `dancing-fish-hero.jpg`
   - ❌ `Dancing Fish Hero.jpg`

2. **File Formats**:
   - Use `.jpg` for photos
   - Use `.png` for logos (with transparency)
   - Keep files under 500KB

3. **Image Sizes**:
   - Brand hero images: 1920x800px
   - Brand cards: 800x600px
   - Logos: 400x400px (PNG with transparency)

4. **Optimize Before Upload**:
   - Use https://tinypng.com/ to compress
   - Or use https://squoosh.app/ for more control

## 🔗 How to Use in Code

After placing your image in the folder, reference it in your React components:

```jsx
// Example: Using a brand hero image
<img src="/images/brands/bushido/hero.jpg" alt="Bushido Japanese Tapas Bar" />

// Example: Using RCX logo
<img src="/images/logos/rcx-logo-white.png" alt="RCX Group" />
```

## 📝 Need Help?

Check the main IMAGE_GUIDE.md in the project root for detailed instructions!
