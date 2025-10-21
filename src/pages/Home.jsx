import { Link, useNavigate } from "react-router-dom";
import SEO, { generateOrganizationStructuredData } from "../components/SEO";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // Service Categories
  const serviceCategories = [
    {
      name: "1-on-1 Coaching",
      description: "Personalized coaching sessions tailored to your goals",
      icon: "person",
      link: "/services",
    },
    {
      name: "Group Sessions",
      description: "Collaborative learning in small group settings",
      icon: "groups",
      link: "/services",
    },
    {
      name: "Career Development",
      description: "Professional coaching for career advancement",
      icon: "trending_up",
      link: "/services",
    },
  ];

  // Benefits/Features
  const benefits = [
    {
      icon: "calendar_month",
      title: "Flexible Scheduling",
      description: "Book appointments at times that work for you",
    },
    {
      icon: "verified",
      title: "Expert Coaches",
      description: "Work with experienced, certified professionals",
    },
    {
      icon: "video_call",
      title: "Virtual & In-Person",
      description: "Choose the format that suits your needs",
    },
    {
      icon: "analytics",
      title: "Track Progress",
      description: "Monitor your growth and achievements over time",
    },
    {
      icon: "schedule",
      title: "Recurring Bookings",
      description: "Set up regular sessions for consistent progress",
    },
    {
      icon: "support_agent",
      title: "Ongoing Support",
      description: "Get help and guidance whenever you need it",
    },
  ];

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
          <h1>Schedule Your Success</h1>
          <p>
            Professional coaching and tutoring services to help you reach
            your goals
          </p>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => navigate("/services")}
          >
            Browse Services
          </button>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>
              Choose from a variety of coaching and tutoring services designed
              to help you achieve your personal and professional goals.
            </p>
          </div>

          <div className="services-grid">
            {serviceCategories.map((category, index) => (
              <div key={index} className="service-category-card">
                <div className="category-icon">
                  <span className="material-symbols-outlined">
                    {category.icon}
                  </span>
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <button
                  className="btn btn--primary"
                  onClick={() => navigate(category.link)}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Booked</h2>
            <p>
              Experience a seamless booking process with features designed to
              support your growth journey.
            </p>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">
                    {benefit.icon}
                  </span>
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
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
