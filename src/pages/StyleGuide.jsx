import { theme } from '../config/theme';

export default function StyleGuide() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 className="heading heading--xl" style={{ marginBottom: '10px' }}>
        Design System Style Guide
      </h1>
      <p className="text text--muted" style={{ marginBottom: '40px' }}>
        Complete reference for the whitelabel design system
      </p>

      {/* How It Works Section */}
      <section style={{ marginBottom: '60px' }}>
        <div className="card card--elevated" style={{ background: '#FEF3C7', border: '2px solid #F59E0B' }}>
          <h2 className="heading heading--lg" style={{ marginBottom: '20px', color: '#92400E' }}>
            ⚠️ How This System Works
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h3 className="heading heading--sm" style={{ marginBottom: '10px' }}>design-system.css provides:</h3>
              <ul style={{ marginLeft: '20px' }}>
                <li className="text text--sm">✅ Static CSS variables (defaults/fallbacks)</li>
                <li className="text text--sm">✅ BEM utility classes (.btn, .card, etc.)</li>
                <li className="text text--sm">✅ Universal values (spacing, shadows)</li>
              </ul>
            </div>

            <div>
              <h3 className="heading heading--sm" style={{ marginBottom: '10px' }}>theme.js provides:</h3>
              <ul style={{ marginLeft: '20px' }}>
                <li className="text text--sm">✅ Client-specific brand colors</li>
                <li className="text text--sm">✅ Company information</li>
                <li className="text text--sm">✅ Feature toggles</li>
                <li className="text text--sm">✅ JavaScript access to theme values</li>
              </ul>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px', background: 'white' }}>
            <p className="text text--bold" style={{ marginBottom: '10px' }}>How they work together:</p>
            <ol style={{ marginLeft: '20px' }}>
              <li className="text text--sm">design-system.css defines: <code>--color-primary: #f8f8f8</code> (default)</li>
              <li className="text text--sm">theme.js overrides via App.jsx: <code>--color-primary: {theme.colors.primary}</code> (client brand)</li>
              <li className="text text--sm">All utility classes use: <code>background: var(--color-primary)</code> (gets client color)</li>
            </ol>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '8px' }}>
            <p className="text text--bold">To customize brand colors:</p>
            <p className="text text--sm">❌ DON'T edit design-system.css :root variables</p>
            <p className="text text--sm">✅ DO edit <code>/src/config/theme.js</code> colors object</p>
          </div>
        </div>
      </section>

      {/* Buttons Documentation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          📚 Buttons
        </h2>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Variants</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-secondary">Outline</button>
            <button className="btn btn-success">Success</button>
            <button className="btn btn-danger">Error</button>
          </div>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-secondary">Outline</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Error</button>`}
          </pre>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn btn-primary btn-sm">Small</button>
            <button className="btn btn-primary">Default</button>
            <button className="btn btn-primary btn-lg">Large</button>
          </div>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>`}
          </pre>
        </div>

        <div className="card">
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>States</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button className="btn btn-primary">Enabled</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<button class="btn btn-primary">Enabled</button>
<button class="btn btn-primary" disabled>Disabled</button>`}
          </pre>
        </div>
      </section>

      {/* Cards Documentation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          🎴 Cards
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="card">
            <h3 className="heading heading--sm">Default Card</h3>
            <p className="text text--sm">Standard padding and shadow</p>
          </div>
          <div className="card card--sm">
            <h3 className="heading heading--sm">Small Card</h3>
            <p className="text text--sm">Reduced padding</p>
          </div>
          <div className="card card--lg">
            <h3 className="heading heading--sm">Large Card</h3>
            <p className="text text--sm">Increased padding</p>
          </div>
          <div className="card card--elevated">
            <h3 className="heading heading--sm">Elevated Card</h3>
            <p className="text text--sm">Enhanced shadow</p>
          </div>
          <div className="card card--bordered">
            <h3 className="heading heading--sm">Bordered Card</h3>
            <p className="text text--sm">Border instead of shadow</p>
          </div>
        </div>

        <div className="card">
          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<div class="card">Default card</div>
<div class="card card--sm">Small card</div>
<div class="card card--lg">Large card</div>
<div class="card card--elevated">Elevated card</div>
<div class="card card--bordered">Bordered card</div>`}
          </pre>
        </div>
      </section>

      {/* Typography Documentation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          📝 Typography
        </h2>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Headings</h3>
          <h1 className="heading heading--xl">Extra Large Heading (.heading--xl) - 48px</h1>
          <h2 className="heading heading--lg">Large Heading (.heading--lg) - 36px</h2>
          <h3 className="heading heading--md">Medium Heading (.heading--md) - 24px</h3>
          <h4 className="heading heading--sm">Small Heading (.heading--sm) - 18px</h4>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto', marginTop: '20px' }}>
{`<h1 class="heading heading--xl">Extra Large</h1>
<h2 class="heading heading--lg">Large</h2>
<h3 class="heading heading--md">Medium</h3>
<h4 class="heading heading--sm">Small</h4>`}
          </pre>
        </div>

        <div className="card">
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Text Treatments</h3>
          <p className="text">Normal text (.text)</p>
          <p className="text text--muted">Muted text (.text--muted)</p>
          <p className="text text--bold">Bold text (.text--bold)</p>
          <p className="text text--uppercase">Uppercase text (.text--uppercase)</p>
          <p className="text text--center">Centered text (.text--center)</p>
          <p className="text text--sm">Small text (.text--sm) - 14px</p>
          <p className="text text--xs">Extra small text (.text--xs) - 13px</p>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto', marginTop: '20px' }}>
{`<p class="text text--muted">Muted text</p>
<p class="text text--bold">Bold text</p>
<p class="text text--uppercase">Uppercase text</p>`}
          </pre>
        </div>
      </section>

      {/* Badges Documentation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          🏷️ Badges
        </h2>

        <div className="card">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span className="badge badge--success">Success</span>
            <span className="badge badge--error">Error</span>
            <span className="badge badge--warning">Warning</span>
            <span className="badge badge--primary">Primary</span>
          </div>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<span class="badge badge--success">Success</span>
<span class="badge badge--error">Error</span>
<span class="badge badge--warning">Warning</span>
<span class="badge badge--primary">Primary</span>`}
          </pre>
        </div>
      </section>

      {/* Containers Documentation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          📦 Containers
        </h2>

        <div className="card">
          <p className="text text--bold" style={{ marginBottom: '15px' }}>Current container: .container (max-width: 1280px)</p>

          <div style={{ marginBottom: '20px' }}>
            <div className="container container--sm">
              <div className="card">
                <p className="text text--bold">.container--sm</p>
                <p className="text text--sm text--muted">Max-width: 768px</p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div className="container container--lg">
              <div className="card">
                <p className="text text--bold">.container--lg</p>
                <p className="text text--sm text--muted">Max-width: 1440px</p>
              </div>
            </div>
          </div>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<div class="container">Default - 1280px</div>
<div class="container container--sm">Small - 768px</div>
<div class="container container--lg">Large - 1440px</div>`}
          </pre>
        </div>
      </section>

      {/* Forms Documentation */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          📋 Forms
        </h2>

        <div className="card">
          <div className="form-group">
            <label className="form-label">Text Input</label>
            <input type="text" className="form-input" placeholder="Enter text..." />
          </div>

          <div className="form-group">
            <label className="form-label">Textarea</label>
            <textarea className="form-textarea" placeholder="Enter message..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Select Dropdown</label>
            <select className="form-select">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Error State</label>
            <input type="text" className="form-input" placeholder="Invalid input" />
            <p className="form-error">This field is required</p>
          </div>

          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`<div class="form-group">
  <label class="form-label">Email Address</label>
  <input type="email" class="form-input" />
  <p class="form-error">This field is required</p>
</div>`}
          </pre>
        </div>
      </section>

      {/* CSS Variables Reference */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          🎨 CSS Variables Reference
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Spacing</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="text text--sm">--spacing-xs (4px)</li>
              <li className="text text--sm">--spacing-sm (8px)</li>
              <li className="text text--sm">--spacing-md (16px)</li>
              <li className="text text--sm">--spacing-lg (24px)</li>
              <li className="text text--sm">--spacing-xl (32px)</li>
              <li className="text text--sm">--spacing-2xl (48px)</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Border Radius</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="text text--sm">--radius-sm (6px)</li>
              <li className="text text--sm">--radius-md (8px)</li>
              <li className="text text--sm">--radius-lg (12px)</li>
              <li className="text text--sm">--radius-xl (16px)</li>
              <li className="text text--sm">--radius-full (9999px)</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Shadows</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="text text--sm">--shadow-sm (subtle)</li>
              <li className="text text--sm">--shadow-md (standard)</li>
              <li className="text text--sm">--shadow-lg (elevated)</li>
              <li className="text text--sm">--shadow-xl (prominent)</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>Transitions</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li className="text text--sm">--transition-fast (0.15s)</li>
              <li className="text text--sm">--transition-base (0.2s)</li>
              <li className="text text--sm">--transition-slow (0.3s)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Usage Tips */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          💡 Usage Tips
        </h2>

        <div className="card card--bordered" style={{ marginBottom: '20px' }}>
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>1. Combine Classes</h3>
          <button className="btn btn-primary btn-lg">Large Primary Button</button>
          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto', marginTop: '15px' }}>
{`<button class="btn btn-primary btn-lg">Large Primary Button</button>`}
          </pre>
        </div>

        <div className="card card--bordered" style={{ marginBottom: '20px' }}>
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>2. Use CSS Variables in Custom Styles</h3>
          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`.my-custom-element {
  padding: var(--spacing-lg);
  color: var(--color-primary);
  border-radius: var(--radius-md);
}`}
          </pre>
        </div>

        <div className="card card--bordered">
          <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>3. Override in client.css</h3>
          <pre className="text text--xs" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '6px', overflow: 'auto' }}>
{`.btn-primary {
  background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  border-radius: var(--radius-full);
}`}
          </pre>
        </div>
      </section>

      {/* Anti-Patterns */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          🚫 Anti-Patterns (DON'T Do This)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ background: '#FEE2E2', border: '1px solid #EF4444' }}>
            <h3 className="heading heading--sm" style={{ marginBottom: '10px', color: '#991B1B' }}>❌ Don't hardcode colors</h3>
            <pre className="text text--xs" style={{ background: 'white', padding: '8px', borderRadius: '4px' }}>
{`.my-button {
  background: #FF0000;
}`}
            </pre>
          </div>

          <div className="card" style={{ background: '#D1FAE5', border: '1px solid #10B981' }}>
            <h3 className="heading heading--sm" style={{ marginBottom: '10px', color: '#065F46' }}>✅ Use CSS variables</h3>
            <pre className="text text--xs" style={{ background: 'white', padding: '8px', borderRadius: '4px' }}>
{`.my-button {
  background: var(--color-error);
}`}
            </pre>
          </div>

          <div className="card" style={{ background: '#FEE2E2', border: '1px solid #EF4444' }}>
            <h3 className="heading heading--sm" style={{ marginBottom: '10px', color: '#991B1B' }}>❌ Don't create duplicates</h3>
            <pre className="text text--xs" style={{ background: 'white', padding: '8px', borderRadius: '4px' }}>
{`.primary-btn
.button-primary
.btn-primary-new`}
            </pre>
          </div>

          <div className="card" style={{ background: '#D1FAE5', border: '1px solid #10B981' }}>
            <h3 className="heading heading--sm" style={{ marginBottom: '10px', color: '#065F46' }}>✅ Extend existing</h3>
            <pre className="text text--xs" style={{ background: 'white', padding: '8px', borderRadius: '4px' }}>
{`Use .btn-primary
Override in client.css`}
            </pre>
          </div>
        </div>
      </section>

      {/* Links */}
      <section>
        <div className="card card--elevated">
          <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
            📖 Further Reading
          </h2>
          <ul style={{ marginLeft: '20px' }}>
            <li className="text"><a href="http://getbem.com/" target="_blank" rel="noopener noreferrer">BEM Naming Convention</a></li>
            <li className="text"><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties" target="_blank" rel="noopener noreferrer">CSS Variables Guide</a></li>
            <li className="text"><code>/NEW_CLIENT.md</code> - Whitelabel Setup Guide</li>
            <li className="text"><code>/CSS_CUSTOMIZATION.md</code> - CSS Customization Guide</li>
            <li className="text"><code>/src/config/theme.js</code> - Theme Configuration</li>
            <li className="text"><a href="/test-utilities">Visual Test Page</a> - Test all utilities and color swatches</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
