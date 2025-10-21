import SEO from "../components/SEO";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <SEO
        title="About Booked"
        description="Learn about Booked, a modern platform connecting clients with professional coaches and tutors for personalized growth and development."
        keywords={[
          "about booked",
          "coaching platform",
          "tutoring services",
          "professional development",
          "life coaching",
          "career coaching",
          "online tutoring",
          "booking platform",
        ]}
      />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About Booked</h1>
          <p className="hero-subtitle">
            Empowering personal and professional growth through expert coaching and tutoring
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
                At Booked, we believe that everyone deserves access to quality coaching and
                tutoring services that can help them reach their full potential. Our platform
                connects ambitious individuals with experienced professionals who are passionate
                about helping others succeed.
              </p>
              <p>
                Whether you're looking to advance your career, develop new skills, overcome
                personal challenges, or achieve academic excellence, Booked makes it easy to
                find and schedule sessions with the right expert for your needs.
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
                Booked was founded with a simple vision: to make professional coaching and
                tutoring accessible to everyone. We saw that while there were many talented
                coaches and tutors available, it was often difficult for clients to find the
                right match and coordinate schedules.
              </p>
              <p>
                Our platform solves this problem by providing a seamless booking experience,
                transparent pricing, and a carefully curated network of verified professionals.
                We handle the logistics so you can focus on what matters most—your growth and
                development.
              </p>
              <p>
                Since our launch, we've helped thousands of clients achieve their goals through
                personalized coaching and tutoring sessions. We're proud to be part of their
                success stories and are committed to continuing to provide the highest quality
                service.
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