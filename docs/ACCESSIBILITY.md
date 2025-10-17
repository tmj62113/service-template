# Accessibility Setup & Guidelines

This e-commerce template is built with **WCAG 2.1 Level AA compliance** in mind, ensuring your store is accessible to users with disabilities, including those using screen readers, keyboard navigation, and other assistive technologies.

## ✅ Built-in Accessibility Features

This template includes comprehensive accessibility features out of the box:

### 1. Keyboard Navigation
- **Skip to Content Link**: Press `Tab` on any page to reveal a "Skip to main content" link that bypasses navigation
- **Focus Management**: All interactive elements are keyboard accessible
- **Visual Focus Indicators**: Clear focus outlines appear when navigating with keyboard (WCAG 2.1 AA compliant)
- **Modal Focus Trapping**: When modals open, focus is trapped inside until closed
- **Escape Key Support**: Press `Escape` to close modals and overlays

### 2. Screen Reader Support
- **Semantic HTML**: Proper use of `<main>`, `<nav>`, `<article>`, `<aside>` landmark elements
- **ARIA Labels**: Comprehensive `aria-label`, `aria-labelledby`, and `aria-describedby` attributes
- **Icon Accessibility**: All decorative icons marked with `aria-hidden="true"`
- **Dynamic Content Announcements**: Live regions for cart updates, form submissions, and errors
- **Screen Reader Only Content**: `.sr-only` utility class for context that's hidden visually but read by screen readers

### 3. Forms & Inputs
- **Associated Labels**: All form inputs have properly associated `<label>` elements
- **Required Field Indicators**: Visual and semantic marking of required fields
- **Error Announcements**: Form errors announced via `role="alert"` and `aria-live="assertive"`
- **Success Messages**: Form success messages announced via `role="status"` and `aria-live="polite"`

### 4. Interactive Elements
- **Button Labels**: All icon-only buttons have descriptive `aria-label` attributes
- **Link Purpose**: All links clearly describe their destination
- **Modal Dialogs**: Proper `role="dialog"`, `aria-modal="true"`, and `aria-label` attributes
- **Cart Notifications**: Dynamic cart count announced to screen readers

### 5. Visual Design
- **Color Contrast**: All text meets WCAG AA standards (4.5:1 ratio for normal text, 3:1 for large text)
- **Focus Visible**: Clear 3px outline with 2px offset on focused elements
- **Hover States**: Visual feedback for all interactive elements
- **Touch Targets**: Minimum 44x44px tap targets for mobile users

## 🛠️ Customizing for Your Client

### Color Contrast

When customizing brand colors in `/src/config/theme.js`, ensure proper contrast ratios:

```javascript
// theme.js
export const theme = {
  colors: {
    primary: '#your-primary-color',    // Must contrast 4.5:1 with white/background
    secondary: '#your-secondary-color', // Must contrast 4.5:1 with white/background
    dark: '#your-dark-color',          // Must contrast 4.5:1 with white
  },
};
```

**Use a contrast checker tool:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect > Accessibility tab shows contrast ratios

### Adding New Components

When creating custom components, follow these accessibility patterns:

#### Buttons
```jsx
// ✅ GOOD: Icon button with aria-label
<button aria-label="Add to cart" onClick={handleAddToCart}>
  <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
</button>

// ❌ BAD: Icon button without label
<button onClick={handleAddToCart}>
  <span className="material-symbols-outlined">shopping_cart</span>
</button>
```

#### Links
```jsx
// ✅ GOOD: Descriptive link text
<Link to="/products" aria-label="View all products">
  Shop Now
</Link>

// ❌ BAD: Generic "Click here" text
<Link to="/products">Click here</Link>
```

#### Forms
```jsx
// ✅ GOOD: Label associated with input
<div className="form-group">
  <label htmlFor="email">Email Address *</label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-required="true"
  />
</div>

// ❌ BAD: No label association
<input type="email" placeholder="Email" />
```

#### Error Messages
```jsx
// ✅ GOOD: Error announced to screen readers
{error && (
  <div className="error-message" role="alert" aria-live="assertive">
    {error}
  </div>
)}

// ❌ BAD: Error not announced
{error && <div className="error-message">{error}</div>}
```

#### Modals/Dialogs
```jsx
// ✅ GOOD: Modal with proper ARIA attributes
<div
  role="dialog"
  aria-modal="true"
  aria-label="Shopping cart"
>
  {/* Modal content */}
</div>

// ❌ BAD: Modal without ARIA attributes
<div className="modal">
  {/* Modal content */}
</div>
```

## 🧪 Testing Accessibility

### Automated Testing

Run accessibility tests during development:

```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Use in your tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Example test
test('Page has no accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

#### Keyboard Navigation Test
1. Navigate the entire site using only `Tab`, `Shift+Tab`, `Enter`, and `Escape`
2. Verify all interactive elements are reachable and have visible focus indicators
3. Ensure modals trap focus and can be closed with `Escape`
4. Test the skip link appears when pressing `Tab` on page load

#### Screen Reader Test
**macOS (VoiceOver):**
```bash
# Enable VoiceOver
Cmd + F5

# Navigate by landmarks
Control + Option + U (to open rotor, then select Landmarks)

# Read content
Control + Option + A (start reading)
```

**Windows (NVDA - Free):**
1. Download NVDA from https://www.nvaccess.org/
2. Press `Insert + Down Arrow` to start reading
3. Press `D` to navigate by landmarks

#### Contrast Test
1. Use browser DevTools:
   - Chrome: Inspect > Accessibility tab
   - Firefox: Inspect > Accessibility tab
2. Check all text elements show "AA" or better contrast ratios

### Browser Extensions for Testing

- **axe DevTools**: Free accessibility testing tool
  - Chrome: https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd
  - Firefox: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/

- **WAVE**: Visualize accessibility issues on page
  - Chrome: https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh
  - Firefox: https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/

## 📋 Pre-Launch Accessibility Checklist

Before launching your client's e-commerce store, verify:

### Content
- [ ] All images have descriptive `alt` attributes
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skipping levels)
- [ ] Link text is descriptive (avoid "click here", "read more")
- [ ] Color is not the only way to convey information

### Keyboard
- [ ] All functionality available via keyboard
- [ ] Skip to content link works on all pages
- [ ] Focus order is logical
- [ ] No keyboard traps (user can always escape modals/overlays)
- [ ] Visible focus indicators on all interactive elements

### Screen Reader
- [ ] Page landmarks are properly labeled (`<main>`, `<nav>`, `<aside>`)
- [ ] Forms have associated labels
- [ ] Errors are announced via `role="alert"`
- [ ] Success messages are announced via `role="status"`
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`

### Visual
- [ ] Text contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Text can be resized to 200% without loss of functionality
- [ ] Touch targets are at least 44x44px
- [ ] Hover states are clearly visible

### Testing
- [ ] Run axe DevTools on all major pages (no violations)
- [ ] Navigate entire site with keyboard only
- [ ] Test with screen reader (VoiceOver or NVDA)
- [ ] Test in high contrast mode (Windows High Contrast Mode)
- [ ] Test with browser zoom at 200%

## 🔍 Common Accessibility Issues to Avoid

### 1. Missing Alt Text
```jsx
// ❌ BAD
<img src="/product.jpg" />

// ✅ GOOD
<img src="/product.jpg" alt="Hand-painted ceramic vase with blue floral pattern" />

// ✅ GOOD (decorative image)
<img src="/decorative-border.svg" alt="" role="presentation" />
```

### 2. Icon-Only Buttons Without Labels
```jsx
// ❌ BAD
<button onClick={handleEdit}>
  <span className="material-symbols-outlined">edit</span>
</button>

// ✅ GOOD
<button onClick={handleEdit} aria-label="Edit product">
  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
</button>
```

### 3. Form Inputs Without Labels
```jsx
// ❌ BAD
<input type="email" placeholder="Enter your email" />

// ✅ GOOD
<label htmlFor="email">Email Address</label>
<input type="email" id="email" name="email" />
```

### 4. Low Contrast Text
```css
/* ❌ BAD: Gray text on white background (2.5:1 ratio) */
.product-description {
  color: #999999;
  background: #ffffff;
}

/* ✅ GOOD: Dark gray text on white background (7.0:1 ratio) */
.product-description {
  color: #595959;
  background: #ffffff;
}
```

### 5. Keyboard Focus Not Visible
```css
/* ❌ BAD: Removing focus outline without replacement */
button:focus {
  outline: none;
}

/* ✅ GOOD: Custom focus indicator (already included in template) */
button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

## 📚 Resources

### WCAG Guidelines
- **WCAG 2.1 Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **Understanding WCAG**: https://www.w3.org/WAI/WCAG21/Understanding/

### Testing Tools
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/
- **Lighthouse (Chrome)**: Built into Chrome DevTools > Lighthouse tab
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/

### Screen Readers
- **NVDA (Windows)**: https://www.nvaccess.org/ (Free)
- **JAWS (Windows)**: https://www.freedomscientific.com/products/software/jaws/ (Paid)
- **VoiceOver (macOS/iOS)**: Built into Mac and iPhone
- **TalkBack (Android)**: Built into Android devices

### Learning Resources
- **WebAIM**: https://webaim.org/
- **A11Y Project**: https://www.a11yproject.com/
- **MDN Accessibility Guide**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

## 🆘 Support

If you encounter accessibility issues or have questions:

1. Check the **Resources** section above for guidelines
2. Test with **axe DevTools** to identify specific WCAG violations
3. Review the **Common Issues** section for quick fixes
4. Consult WCAG 2.1 documentation for detailed requirements

---

**Remember**: Accessibility is not just about compliance—it's about creating an inclusive shopping experience for all users, regardless of their abilities or how they access your site.
