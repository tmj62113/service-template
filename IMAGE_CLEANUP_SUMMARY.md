# Image Cleanup Summary - Booked Application

## What Was Done

### Removed Art-Related Images:
✅ Deleted `public/images/homepage/` directory (contained art collection images)
✅ Deleted `public/images/poh 2023/` directory (Parade of Hearts event photos)
✅ Deleted `public/images/peterson_headshot.jpg` (artist headshot)
✅ Deleted `public/peterson_logo.png` (old logo)

### Created New Image Structure:
✅ Created `public/images/hero/` - For homepage hero images
✅ Created `public/images/services/` - For service-specific images
✅ Created `public/images/team/` - For staff headshots and office photos
✅ Created `public/images/placeholders/` - For temporary placeholder images

### Documentation Added:
✅ Created `public/images/STOCK_PHOTOS_GUIDE.md` - Comprehensive guide for sourcing images
✅ Created `README.md` files in each directory with specific guidance

## Current State

### Remaining Files in `public/`:
- `booked_logo.png` - Your Booked logo ✅
- `favicon.png` - Site favicon ✅
- `robots.txt` - SEO file ✅
- `images/` - Empty directory structure ready for new images

### Directory Structure:
```
public/
├── booked_logo.png
├── favicon.png
├── robots.txt
└── images/
    ├── STOCK_PHOTOS_GUIDE.md
    ├── hero/
    │   └── README.md
    ├── services/
    │   └── README.md
    ├── team/
    │   └── README.md
    └── placeholders/
```

## Next Steps

### 1. Download Stock Photos
Visit these free stock photo websites:
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Pixabay**: https://pixabay.com

### 2. Recommended Search Terms:
**For Coaching/Tutoring:**
- "life coach consultation"
- "one on one mentoring"
- "professional coaching session"
- "tutoring session"
- "business mentoring"
- "career counseling"

**For Success/Growth:**
- "achievement celebration"
- "goal success"
- "professional growth"
- "breakthrough moment"

**For Team/About:**
- "professional headshot"
- "business portrait"
- "modern office space"
- "consultation room"

### 3. Image Requirements:

#### Hero Images (for homepage):
- **Size**: 1920x1080px minimum
- **Format**: WebP or JPG
- **Quantity**: 1-3 images
- **Place in**: `public/images/hero/`

#### Service Images:
- **Size**: 800x600px minimum
- **Format**: WebP or JPG
- **Quantity**: 1 per service type (3-5 images)
- **Place in**: `public/images/services/`

#### Team/Staff Images:
- **Size**: 400x400px (headshots), 1200x800px (office)
- **Format**: WebP or JPG
- **Quantity**: As many as needed
- **Place in**: `public/images/team/`

### 4. Image Optimization
Before adding images, optimize them:
- **Online Tools**:
  - TinyPNG (https://tinypng.com)
  - Squoosh (https://squoosh.app)
- **Convert to WebP** for better performance
- **Keep file sizes under 500KB** for fast loading

### 5. Update Pages
After adding images, update these pages:
- `src/pages/Home.jsx` - Update hero images
- `src/pages/Services.jsx` - Update service images
- `src/pages/About.jsx` - Update team/about images

## Quick Start Checklist

- [ ] Visit Unsplash.com or Pexels.com
- [ ] Download 1-2 hero images (coaching session, success)
- [ ] Download 3-5 service images (different coaching types)
- [ ] Download team headshots or office photos (if needed)
- [ ] Optimize images with TinyPNG or Squoosh
- [ ] Place images in appropriate directories
- [ ] Update page components to use new images
- [ ] Test image loading in browser

## Example File Names:
```
public/images/hero/
├── coaching-session-hero.webp
└── success-celebration.webp

public/images/services/
├── one-on-one-coaching.webp
├── group-session.webp
├── career-coaching.webp
└── life-coaching.webp

public/images/team/
├── coach-headshot-1.webp
├── coach-headshot-2.webp
└── modern-office.webp
```

## Style Guidelines

### What to Look For:
✅ Bright, well-lit photos
✅ Professional but approachable feel
✅ Diverse representation
✅ Modern, clean aesthetics
✅ Genuine expressions (not overly posed)
✅ 1-3 people per image
✅ Business casual attire

### What to Avoid:
❌ Overly "stock photo" feeling
❌ Fake or forced smiles
❌ Cluttered backgrounds
❌ Dark or poorly lit images
❌ Overly formal/stuffy imagery
❌ Outdated styling

## Color Considerations
Choose images that complement your brand:
- Look for images with neutral/professional tones
- Bright, positive lighting
- Clean backgrounds (white, light gray, natural settings)
- Avoid images with strong color casts that clash with your brand

## Need Help?
Refer to `public/images/STOCK_PHOTOS_GUIDE.md` for detailed guidance on:
- Where to find free stock photos
- Specific search terms
- Image specifications
- Optimization tips
- Best practices

---

**Ready to add images?** Start by downloading 1-2 hero images from Unsplash and place them in `public/images/hero/`!
