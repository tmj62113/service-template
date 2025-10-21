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
          <h1>About Clockwork</h1>
          <p className="hero-subtitle">
            The scheduling platform that helps service professionals escape the chaos and focus on their craft
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                At Clockwork, we're on a mission to free service professionals from administrative chaos so they can focus on what truly matters—delivering exceptional service to their clients.
              </p>
              <p>
                Whether you're a coach, consultant, therapist, tutor, or creative professional, you didn't start your business to spend hours managing calendars, chasing payments, or coordinating schedules. You started because you're passionate about your craft and helping your clients succeed.
              </p>
              <p>
                Clockwork gives you back your time by automating the tedious parts of running a service business, so you can spend more energy doing the work you love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="about-section alt-bg">
        <div className="container">
          <h2>What We Do</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-symbols-outlined">school</span>
              </div>
              <h3>Expert Coaching</h3>
              <p>
                Connect with certified coaches who specialize in career development,
                leadership, life coaching, and personal growth. Our experts bring years
                of experience and proven methodologies.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3>Personalized Tutoring</h3>
              <p>
                Access skilled tutors across a wide range of subjects and skill levels.
                From academic support to professional certifications, we have tutors who
                can help you master any topic.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <h3>Flexible Scheduling</h3>
              <p>
                Book sessions that fit your schedule, whether you prefer morning, afternoon,
                or evening appointments. Choose between virtual sessions or in-person meetings
                based on your preference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                We believe running a service business shouldn't feel like juggling chaos.
              </p>
              <p>
                Every service professional knows the frustration: clients calling to book, appointment conflicts, payment follow-ups, calendar chaos, and endless admin work that keeps you from doing what you actually love.
              </p>
              <p>
                That's why we built Clockwork.
              </p>
              <p>
                Our platform handles the logistics so you can focus on what matters most—serving your clients and doing the work you're passionate about. From automated scheduling and payment processing to calendar management and client communications, Clockwork takes care of the admin chaos that drains your time and energy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section alt-bg">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Excellence</h3>
              <p>
                We maintain the highest standards in our selection of coaches and tutors,
                ensuring every professional on our platform is qualified, experienced, and
                passionate about helping others.
              </p>
            </div>
            <div className="value-item">
              <h3>Accessibility</h3>
              <p>
                Quality coaching and tutoring should be available to everyone. We strive to
                offer flexible pricing options and scheduling to make our services accessible
                to all who seek them.
              </p>
            </div>
            <div className="value-item">
              <h3>Trust</h3>
              <p>
                We build trust through transparency, security, and reliability. Your personal
                information is protected, and our booking system is designed to be simple and
                dependable.
              </p>
            </div>
            <div className="value-item">
              <h3>Growth</h3>
              <p>
                We're committed to continuous improvement—both for our clients and our platform.
                We regularly gather feedback and evolve to better serve your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>
            Join thousands of clients who have transformed their lives through coaching and tutoring.
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