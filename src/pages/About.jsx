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
          <h1>
            We believe running a service business shouldn't feel like juggling
            chaos.
          </h1>
          <p className="hero-body">
            Every service professional knows the frustration: clients calling to
            book, appointment conflicts, payment follow-ups, calendar chaos, and
            endless admin work that keeps you from doing what you actually love.
          </p>
          <p className="hero-emphasis">That's why we built Clockwork.</p>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="about-section">
        <div className="container">
          <h2>What Makes Us Different</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Built for How You Actually Work</h3>
              <h4>Customize Everything</h4>
              <p>
                Your salon doesn't look like every other salon. Your consulting practice isn't cookie-cutter. Why should your scheduling software be? Clockwork adapts to your brand—your colors, your workflow, your way.
              </p>
            </div>
            <div className="feature-card">
              <h3>Simple by Design</h3>
              <p>
                We don't believe in feature bloat. Every feature in Clockwork exists because service professionals actually asked for it. Nothing extra, nothing confusing—just what you need to run smoothly.
              </p>
            </div>
            <div className="feature-card">
              <h3>Reliable as Time</h3>
              <p>
                When your livelihood depends on appointments showing up and payments processing, reliability isn't optional. Clockwork is built to work consistently, every single day. No surprises, no downtime, no stress.
              </p>
            </div>
            <div className="feature-card">
              <h3>Made for Growth</h3>
              <p>
                Whether you're solo today or managing a team tomorrow, Clockwork scales with you. Start simple, grow when you're ready. No forced upgrades, no artificial limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to reclaim your time?</h2>
          <p>
            Join service professionals who focus on their craft, not calendar
            chaos.
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
