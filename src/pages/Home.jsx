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
      <section className="hero-section section-container--full">
        <img
          src="/images/hero/home_hero.png"
          alt="Professional workspace"
          className="hero-image"
        />
        <div className="hero-content">
          <h1>Everything you need to launch and grow</h1>
          <p>
            Clockwork gives you a fully customizable website with booking and
            payment processing built in. <span className="no-wrap">One platform.</span> Any service business.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/services")}
          >
            Work with us
          </button>
        </div>
      </section>
    </div>
  );
}
