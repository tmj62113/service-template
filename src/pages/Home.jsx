import { useNavigate } from "react-router-dom";
import SEO, { generateOrganizationStructuredData } from "../components/SEO";
import HeroSlider from "../components/HeroSlider/HeroSlider";
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
      <section className="hero-section section-container--full">
        <div className="hero-media" aria-hidden="true">
          <img
            src="/images/hero/home_hero.png"
            alt=""
            className="hero-image"
          />
        </div>
        <div className="hero-content">
          <span className="hero-kicker">Modern operations for service brands</span>
          <h1>Everything you need to launch and grow</h1>
          <p>
            Clockwork gives you a fully customizable website with booking and
            payment processing built in.{" "}
            <span className="no-wrap">One platform.</span> Any service business.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/services")}
          >
            Work with us
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container--full features-section">
        <div className="features-full-intro">
          <h2>Why Choose Clockwork?</h2>
          <p>
            We built the booking platform that should've existed all along, one
            that supports your success without getting in your way.
          </p>
        </div>

        <div className="features-full-grid">
          <div className="features-full-card">
            <span className="material-symbols-outlined feature-icon">
              engineering
            </span>
            <div className="features-full-card-content">
              <h3>Complete Project Support</h3>
              <p>
                Design help, showroom access, and fulfillment — all included.
              </p>
            </div>
            <button
              className="btn btn-tertiary"
              onClick={() => navigate("/services")}
            >
              Read more
              <span className="arrow">→</span>
            </button>
          </div>

          <div className="features-full-card">
            <span className="material-symbols-outlined feature-icon">bolt</span>
            <div className="features-full-card-content">
              <h3>Streamlined Operations</h3>
              <p>Fast quoting, accurate deliveries, and less back-and-forth.</p>
            </div>
            <button
              className="btn btn-tertiary"
              onClick={() => navigate("/services")}
            >
              Read more
              <span className="arrow">→</span>
            </button>
          </div>

          <div className="features-full-card">
            <span className="material-symbols-outlined feature-icon">
              workspace_premium
            </span>
            <div className="features-full-card-content">
              <h3>Professional-Grade Range</h3>
              <p>
                From fast flat-pack to bespoke millwork, we've got your project
                covered.
              </p>
            </div>
            <button
              className="btn btn-tertiary"
              onClick={() => navigate("/services")}
            >
              Read more
              <span className="arrow">→</span>
            </button>
          </div>

          <div className="features-full-card">
            <span className="material-symbols-outlined feature-icon">
              handshake
            </span>
            <div className="features-full-card-content">
              <h3>Your Clients Stay Yours</h3>
              <p>
                We support you, not compete with you. Relationships stay yours.
              </p>
            </div>
            <button
              className="btn btn-tertiary"
              onClick={() => navigate("/services")}
            >
              Read more
              <span className="arrow">→</span>
            </button>
          </div>

          <div className="features-full-card">
            <span className="material-symbols-outlined feature-icon">
              savings
            </span>
            <div className="features-full-card-content">
              <h3>True Partnership Pricing</h3>
              <p>
                Earn a real margin on cabinetry — no games, no retail markup.
              </p>
            </div>
            <button
              className="btn btn-tertiary"
              onClick={() => navigate("/services")}
            >
              Read more
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Slider Section */}
      <section className="section-container--full slider-section">
        <h2>You are in the right place if you're a ...</h2>
        <HeroSlider />
      </section>
    </div>
  );
}
