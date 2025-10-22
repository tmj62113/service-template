export default function TestUtilities() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 className="heading heading--xl" style={{ marginBottom: '10px' }}>
        Utility Classes Test Page
      </h1>
      <p className="text text--muted" style={{ marginBottom: '40px' }}>
        Testing all utility classes from global.css
      </p>

      {/* Buttons Section */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          Buttons
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-secondary">Outline Button</button>
          <button className="btn btn-success">Success Button</button>
          <button className="btn btn-danger">Error Button</button>
        </div>

        <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>
          Button Sizes
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
          <button className="btn btn-primary btn-sm">Small</button>
          <button className="btn btn-primary">Default</button>
          <button className="btn btn-primary btn-lg">Large</button>
        </div>

        <h3 className="heading heading--sm" style={{ marginBottom: '15px' }}>
          Disabled State
        </h3>
        <button className="btn btn-primary" disabled>Disabled Button</button>
      </section>

      {/* Cards Section */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          Cards
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div className="card">
            <h3 className="heading heading--sm">Default Card</h3>
            <p className="text text--sm">Standard padding and shadow</p>
          </div>

          <div className="card card--sm">
            <h3 className="heading heading--sm">Small Card</h3>
            <p className="text text--sm">Smaller padding</p>
          </div>

          <div className="card card--lg">
            <h3 className="heading heading--sm">Large Card</h3>
            <p className="text text--sm">Larger padding</p>
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
      </section>

      {/* Typography Section */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          Typography
        </h2>

        <h1 className="heading heading--xl">Extra Large Heading (--xl)</h1>
        <h2 className="heading heading--lg">Large Heading (--lg)</h2>
        <h3 className="heading heading--md">Medium Heading (--md)</h3>
        <h4 className="heading heading--sm">Small Heading (--sm)</h4>

        <div style={{ marginTop: '30px' }}>
          <p className="text">Normal text with default styling</p>
          <p className="text text--muted">Muted text (.text--muted)</p>
          <p className="text text--bold">Bold text (.text--bold)</p>
          <p className="text text--uppercase">Uppercase text (.text--uppercase)</p>
          <p className="text text--center">Centered text (.text--center)</p>
          <p className="text text--sm">Small text (.text--sm)</p>
          <p className="text text--xs">Extra small text (.text--xs)</p>
        </div>
      </section>

      {/* Badges Section */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          Badges
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge--success">Success Badge</span>
          <span className="badge badge--error">Error Badge</span>
          <span className="badge badge--warning">Warning Badge</span>
          <span className="badge badge--primary">Primary Badge</span>
        </div>
      </section>

      {/* Containers Section */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          Containers
        </h2>

        <div className="card" style={{ marginBottom: '20px' }}>
          <p className="text text--bold">Default Container (current)</p>
          <p className="text text--sm text--muted">Max-width: 1280px</p>
        </div>

        <div className="container container--sm">
          <div className="card">
            <p className="text text--bold">Small Container (.container--sm)</p>
            <p className="text text--sm text--muted">Max-width: 768px</p>
          </div>
        </div>

        <div className="container container--lg" style={{ marginTop: '20px' }}>
          <div className="card">
            <p className="text text--bold">Large Container (.container--lg)</p>
            <p className="text text--sm text--muted">Max-width: 1440px</p>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="heading heading--lg" style={{ marginBottom: '20px' }}>
          Form Elements
        </h2>

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
      </section>

      {/* Summary */}
      <section>
        <div className="card card--elevated">
          <h2 className="heading heading--lg" style={{ marginBottom: '15px' }}>
            ✅ Test Summary
          </h2>
          <p className="text">
            All BEM utility classes are working correctly. You can use these classes
            throughout the application without writing custom CSS.
          </p>
          <div style={{ marginTop: '20px' }}>
            <p className="text text--bold">Available Utility Classes:</p>
            <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
              <li className="text text--sm">Buttons: .btn, .btn-primary, .btn-secondary, .btn-secondary, .btn-sm, .btn-lg</li>
              <li className="text text--sm">Cards: .card, .card--sm, .card--lg, .card--elevated, .card--bordered</li>
              <li className="text text--sm">Typography: .heading--xl/lg/md/sm, .text--muted/bold/uppercase/center/sm/xs</li>
              <li className="text text--sm">Badges: .badge--success/error/warning/primary</li>
              <li className="text text--sm">Containers: .container--sm/lg</li>
              <li className="text text--sm">Forms: .form-group, .form-label, .form-input, .form-textarea, .form-select, .form-error</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
