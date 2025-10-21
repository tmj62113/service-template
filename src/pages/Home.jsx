import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SEO, { generateOrganizationStructuredData } from "../components/SEO";
import { getApiUrl } from "../config/api";
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

  // Contact form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    mailingList: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit contact form message
      const response = await fetch(getApiUrl("/api/messages"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: "Contact Form Submission",
          message: formData.message,
          mailingList: formData.mailingList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // If user opted in to mailing list, subscribe them to newsletter
      if (formData.mailingList) {
        try {
          await fetch(getApiUrl("/api/newsletter/subscribe"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              source: "contact-form",
              metadata: {
                name: `${formData.firstName} ${formData.lastName}`,
                submittedAt: new Date().toISOString(),
              },
            }),
          });
        } catch (newsletterError) {
          console.error("Error subscribing to newsletter:", newsletterError);
          // Don't fail the contact form submission if newsletter signup fails
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
          mailingList: false,
        });
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

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
                onClick={() => navigate("/about")}
              >
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Contact Us</h2>

          <div className="contact-intro">
            <p>
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="contact-layout">
            {/* Contact Form */}
            {submitted ? (
              <div className="success-message">
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="mailingList"
                    name="mailingList"
                    checked={formData.mailingList}
                    onChange={handleChange}
                  />
                  <label htmlFor="mailingList">
                    Subscribe to our newsletter for updates and tips
                  </label>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
