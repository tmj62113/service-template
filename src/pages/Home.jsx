import { useNavigate } from "react-router-dom";
import SEO, { generateOrganizationStructuredData } from "../components/SEO";
import "./Home.css";

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
