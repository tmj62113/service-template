# CSS Customization Guide

This guide explains how to customize the CSS styling for your whitelabel e-commerce store.

---

## 📁 CSS File Structure

```
src/
├── index.css                    # Main stylesheet (imports below files)
└── styles/
    ├── design-system.css        # CSS variables + utility classes
    ├── template.css             # All consolidated component/page styles
    └── client.css               # YOUR CLIENT CUSTOMIZATIONS GO HERE
```

### Loading Order

```css
1. design-system.css   /* Variables & utilities */
2. template.css        /* Template styles */
3. client.css          /* Client overrides - LAST, so it wins */
```

---

## 🎨 Step 1: Configure theme.js First

**Before touching CSS**, always start by configuring `/src/config/theme.js`:

```javascript
// This automatically updates CSS variables!
colors: {
  primary: "#CLIENT_COLOR",      // Updates --color-primary
  secondary: "#CLIENT_COLOR",    // Updates --color-secondary
  // ... etc
}
```

**Changes in `theme.js` automatically apply to all CSS** that uses variables.

---

## 🎯 Step 2: Use Utility Classes (No Custom CSS Needed!)

The `design-system.css` provides reusable utility classes following **BEM naming**:

### Buttons (3 Variants)

```html
<!-- Primary button -->
<button class="btn btn--primary">Add to Cart</button>

<!-- Secondary button -->
<button class="btn btn--secondary">Cancel</button>

<!-- Outline button -->
<button class="btn btn--outline">View Details</button>

<!-- With size modifiers -->
<button class="btn btn--primary btn--lg">Large Primary</button>
<button class="btn btn--secondary btn--sm">Small Secondary</button>
```

**Available Button Classes:**
- `.btn` - Base button
- `.btn--primary` - Primary variant (dark background)
- `.btn--secondary` - Secondary variant (white with border)
- `.btn--outline` - Outline variant (transparent with border)
- `.btn--success` - Success/green button
- `.btn--error` - Error/red button
- `.btn--sm` - Small size
- `.btn--lg` - Large size

### Cards (4 Variants)

```html
<!-- Default card -->
<div class="card">Content</div>

<!-- Small card -->
<div class="card card--sm">Less padding</div>

<!-- Large card -->
<div class="card card--lg">More padding</div>

<!-- Elevated card (more shadow) -->
<div class="card card--elevated">More prominent</div>

<!-- Bordered card (no shadow, border instead) -->
<div class="card card--bordered">With border</div>
```

**Available Card Classes:**
- `.card` - Base card
- `.card--sm` - Smaller padding
- `.card--lg` - Larger padding
- `.card--elevated` - Enhanced shadow
- `.card--bordered` - Border instead of shadow

### Typography

```html
<!-- Headings -->
<h1 class="heading heading--xl">Extra Large Heading</h1>
<h2 class="heading heading--lg">Large Heading</h2>
<h3 class="heading heading--md">Medium Heading</h3>
<h4 class="heading heading--sm">Small Heading</h4>

<!-- Text treatments -->
<p class="text text--muted">Muted text</p>
<p class="text text--bold">Bold text</p>
<p class="text text--uppercase">Uppercase Text</p>
<p class="text text--center">Centered text</p>
<p class="text text--sm">Small text</p>
<p class="text text--xs">Extra small text</p>
```

**Available Typography Classes:**
- `.heading` + `.heading--xl|lg|md|sm` - Heading variants
- `.text` - Base text
- `.text--center` - Center aligned
- `.text--muted` - Gray/muted color
- `.text--bold` - Bold weight
- `.text--uppercase` - Uppercase transform
- `.text--sm` - Small size
- `.text--xs` - Extra small size

### Badges

```html
<span class="badge badge--success">In Stock</span>
<span class="badge badge--error">Out of Stock</span>
<span class="badge badge--warning">Low Stock</span>
<span class="badge badge--primary">Featured</span>
```

**Available Badge Classes:**
- `.badge` - Base badge
- `.badge--success` - Green
- `.badge--error` - Red
- `.badge--warning` - Yellow/Orange
- `.badge--primary` - Primary color

### Containers

```html
<div class="container">Regular width (1280px)</div>
<div class="container container--sm">Narrow (768px)</div>
<div class="container container--lg">Wide (1440px)</div>
```

---

## 🖌️ Step 3: Client-Specific Customizations

For styles that **can't** be achieved with utilities, add them to `/src/styles/client.css`:

### Example 1: Custom Button Colors

```css
/* client.css */

/* Override primary button */
.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn--primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
}
```

### Example 2: Custom Product Card Styling

```css
/* client.css */

/* Add border and custom hover effect to product cards */
.product-card {
  border: 2px solid var(--color-gray-200);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.product-card:hover {
  border-color: var(--color-primary);
  transform: scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

### Example 3: Custom Header Styling

```css
/* client.css */

.header {
  background: var(--color-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.header-logo {
  max-width: 180px;
}
```

### Example 4: Custom Typography

```css
/* client.css */

/* Use client's custom font */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

.heading {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.5px;
}
```

### Example 5: Custom Form Styling

```css
/* client.css */

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
}

.form-label {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}
```

---

## 📐 CSS Variables Reference

All variables are defined in `design-system.css` and can be used in `client.css`:

### Colors

```css
--color-primary
--color-primary-dark
--color-primary-light
--color-dark
--color-dark-secondary
--color-gray-900 through --color-gray-50
--color-success, --color-success-light, --color-success-dark
--color-error, --color-error-light, --color-error-dark
--color-warning, --color-warning-light, --color-warning-dark
--color-background
--color-white
```

### Spacing

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### Border Radius

```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

### Shadows

```css
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

### Transitions

```css
--transition-fast: 0.15s ease
--transition-base: 0.2s ease
--transition-slow: 0.3s ease
```

### Typography

```css
--font-family
--font-family-mono
```

---

## 🔍 Finding CSS to Override

### Method 1: Use Browser DevTools

1. Right-click element → "Inspect"
2. See which CSS classes are applied
3. Add overrides to `client.css` for those classes

### Method 2: Search template.css

```bash
# Search for a specific component
grep -n "product-card" src/styles/template.css
```

### Method 3: Common Component Classes

Template uses these class naming patterns:

```
.header              # Main header
.footer              # Main footer
.product-card        # Product cards
.product-gallery     # Product grid
.cart                # Shopping cart
.checkout            # Checkout page
.admin-layout        # Admin dashboard layout
.form-group          # Form sections
.modal               # Modals/dialogs
```

---

## ⚡ Best Practices

### ✅ DO

- **Use CSS variables** for all colors, spacing, and sizes
- **Use utility classes** when possible (`.btn--primary`, `.card--lg`, etc.)
- **Keep client.css minimal** - only add what's truly custom
- **Comment your overrides** - explain why the override is needed
- **Test responsively** - ensure mobile, tablet, desktop all look good

```css
/* ✅ GOOD - Uses variables, clear intent */
.product-card {
  border: 2px solid var(--color-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
}
```

### ❌ DON'T

- **Don't hardcode colors** - use variables
- **Don't duplicate utility classes** - use existing ones
- **Don't modify template.css** - all customizations go in client.css
- **Don't modify design-system.css** - configure theme.js instead

```css
/* ❌ BAD - Hardcoded values */
.product-card {
  border: 2px solid #3b82f6;
  padding: 24px;
  border-radius: 16px;
}
```

---

## 🎬 Complete Example: Boutique Store

Here's a complete example for a high-end boutique store:

```css
/* client.css */

/* =====================================
   CUSTOM FONTS
   ===================================== */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;600&display=swap');

.heading {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.text, .btn, .form-input {
  font-family: 'Montserrat', sans-serif;
}

/* =====================================
   BUTTONS
   ===================================== */
.btn--primary {
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 12px;
  padding: 14px 32px;
}

.btn--primary:hover {
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* =====================================
   PRODUCT CARDS
   ===================================== */
.product-card {
  border: 1px solid var(--color-gray-100);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  border-color: var(--color-dark);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.product-card__image {
  filter: grayscale(10%);
  transition: filter 0.4s ease;
}

.product-card:hover .product-card__image {
  filter: grayscale(0%);
}

/* =====================================
   HEADER
   ===================================== */
.header {
  border-bottom: 1px solid var(--color-gray-200);
  padding: 24px 0;
}

.header-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
}

/* =====================================
   FORMS
   ===================================== */
.form-input,
.form-textarea,
.form-select {
  border: 2px solid var(--color-gray-200);
  border-radius: 0;
  padding: 14px 16px;
  font-size: 14px;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--color-dark);
  box-shadow: none;
}

.form-label {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 600;
  color: var(--color-gray-700);
}
```

---

## 🔄 Workflow for New Clients

1. **Configure `theme.js`** - Set colors, fonts, spacing
2. **Check existing utilities** - Can you use `.btn--primary`, `.card--lg`, etc.?
3. **Add custom styles to `client.css`** - Only what's truly custom
4. **Test across devices** - Mobile, tablet, desktop
5. **Document changes** - Add comments explaining customizations

---

## 🆘 Troubleshooting

### My custom styles aren't applying

1. **Check specificity** - `client.css` loads last, so it should win
2. **Use `!important` sparingly** - Only if absolutely necessary
3. **Check class names** - Ensure you're targeting the right class
4. **Clear browser cache** - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Colors aren't changing

1. **Did you update `theme.js`?** - Colors sync from there
2. **Are you using variables?** - Use `var(--color-primary)` not `#3b82f6`
3. **Check console** - Look for CSS errors

### Layout is broken

1. **Don't modify `template.css`** - Only use `client.css`
2. **Check browser DevTools** - See which styles are conflicting
3. **Test in incognito** - Rule out browser extensions

---

## 📚 Additional Resources

- [BEM Naming Convention](http://getbem.com/) - Understanding Block__Element--Modifier
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [theme.js Documentation](./src/config/theme.js) - All available theme options

---

**Need Help?** Check the existing `template.css` to see how components are structured, then override in `client.css`.

**Happy Styling! 🎨**
