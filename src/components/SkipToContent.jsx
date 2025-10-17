/**
 * SkipToContent Component
 *
 * Accessibility feature that allows keyboard users to skip navigation
 * and jump directly to the main content.
 *
 * WCAG 2.1 Level A Success Criterion 2.4.1 (Bypass Blocks)
 *
 * The link is hidden by default and becomes visible when focused
 * using the Tab key, providing a quick way to navigate for
 * keyboard and screen reader users.
 */
export default function SkipToContent() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
