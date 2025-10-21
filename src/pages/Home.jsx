import { useNavigate } from "react-router-dom";
import SEO, { generateOrganizationStructuredData } from "../components/SEO";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <SEO
        title="Home"
        description="Transform your life with professional coaching and tutoring services. Book personalized sessions with expert coaches for career development, personal growth, and skill advancement."
        keywords={[
          "coaching",
          "tutoring",
          "life coach",
          "career coaching",
          "personal development",
          "professional coaching",
          "online tutoring",
          "appointment booking",
          "schedule coaching session",
        ]}
        structuredData={generateOrganizationStructuredData()}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>The scheduling platform that never misses a beat.</h1>
          <p>
            Clockwork brings your appointments, payments, and client relationships together in one elegant system that bends to your brand. Customize everything—colors, layout, features—to create a booking experience that's unmistakably yours. Spend less time managing your calendar and more time doing what you love.
          </p>
          <p className="hero-tagline">
            Your business, always on time.
          </p>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => navigate("/services")}
          >
            Browse Services
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Everything You Need. Nothing You Don't.</h2>

          <div className="features-grid">
            <div className="feature-card">
              <h3>📅 Smart Scheduling</h3>
              <p>
                Clients book online anytime. Your calendar updates in real-time.
                Double-bookings? Impossible. Conflicts? Gone.
              </p>
            </div>

            <div className="feature-card">
              <h3>💰 Get Paid Faster</h3>
              <p>
                Accept payments at booking. Process cards, track invoices,
                collect deposits—all automated. No more payment follow-ups.
              </p>
            </div>

            <div className="feature-card">
              <h3>✨ Your Brand, Your Way</h3>
              <p>
                Choose your colors. Upload your logo. Customize everything.
                Clients see your brand, not ours.
              </p>
            </div>
          </div>

          <div className="features-cta">
            <button
              className="btn btn--primary btn--lg"
              onClick={() => navigate("/services")}
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="detailed-features-section">
        <div className="container">
          <h2>Built for Service Professionals</h2>

          <div className="detailed-features-grid">
            <div className="detailed-feature-card">
              <h3>📆 Online Booking</h3>
              <p>
                Let clients book 24/7 from any device. No phone tag required.
              </p>
            </div>

            <div className="detailed-feature-card">
              <h3>💳 Payment Processing</h3>
              <p>
                Accept deposits or full payments. Stripe, Square, PayPal—all
                integrated.
              </p>
            </div>

            <div className="detailed-feature-card">
              <h3>📧 Smart Reminders</h3>
              <p>
                Automatic email and SMS reminders reduce no-shows by up to 70%.
              </p>
            </div>

            <div className="detailed-feature-card">
              <h3>👥 Client Management</h3>
              <p>
                Store contacts, history, preferences, and notes—all in one
                place.
              </p>
            </div>

            <div className="detailed-feature-card">
              <h3>📄 Professional Invoicing</h3>
              <p>
                Generate branded invoices automatically. Track what's paid and
                what's pending.
              </p>
            </div>

            <div className="detailed-feature-card">
              <h3>🎨 Full Customization</h3>
              <p>
                Make it yours. Custom colors, branding, forms, and booking
                flows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>
              Book your first session today and take the first step towards
              achieving your goals.
            </p>
            <div className="cta-buttons">
              <button
                className="btn btn--primary btn--lg"
                onClick={() => navigate("/services")}
              >
                Browse Services
              </button>
              <button
                className="btn btn--outline btn--lg"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
