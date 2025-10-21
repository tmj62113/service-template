import SEO from "../components/SEO";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <SEO
        title="About Clockwork"
        description="Learn about Clockwork, the scheduling platform built for service professionals who want to escape calendar chaos and focus on doing what they love."
        keywords={[
          "about clockwork",
          "booking platform",
          "scheduling software",
          "service business management",
          "appointment booking",
          "calendar management",
          "payment processing",
          "business automation",
        ]}
      />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>We believe running a service business shouldn't feel like juggling chaos.</h1>
          <p className="hero-body">
            Every service professional knows the frustration: clients calling to book, appointment conflicts, payment follow-ups, calendar chaos, and endless admin work that keeps you from doing what you actually love.
          </p>
          <p className="hero-emphasis">
            That's why we built Clockwork.
          </p>
          <p className="hero-body">
            Our platform handles the logistics so you can focus on what matters most—serving your clients and doing the work you're passionate about. From automated scheduling and payment processing to calendar management and client communications, Clockwork takes care of the admin chaos that drains your time and energy.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to reclaim your time?</h2>
          <p>
            Join service professionals who focus on their craft, not calendar chaos.
          </p>
          <div className="cta-buttons">
            <a href="/services" className="btn btn--primary btn--lg">
              Browse Services
            </a>
            <a href="/contact" className="btn btn--outline btn--lg">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}