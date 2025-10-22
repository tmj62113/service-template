import { useState } from 'react';
import { theme } from '../config/theme';
import { getApiUrl } from '../config/api';
import SEO from '../components/SEO';
import '../styles/Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    mailingList: false,
    // Honeypot fields (hidden from users, bots will fill them)
    website: '',
    phone: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(getApiUrl('/api/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // If user opted in to mailing list, subscribe them to newsletter
      if (formData.mailingList) {
        try {
          await fetch(getApiUrl('/api/newsletter/subscribe'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              source: 'contact-form',
              metadata: {
                name: formData.name,
                submittedAt: new Date().toISOString(),
              },
            }),
          });
        } catch (newsletterError) {
          console.error('Error subscribing to newsletter:', newsletterError);
          // Don't fail the contact form submission if newsletter signup fails
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          mailingList: false,
          website: '',
          phone: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      <SEO
        title="Contact Us"
        description="Get in touch with Clockwork. Have questions about our coaching or tutoring services? We'd love to hear from you and help you get started."
        keywords={['contact', 'contact us', 'coaching inquiries', 'tutoring questions', 'get in touch', 'customer support', 'book a session']}
      />
      <div className="contact-hero section-container--hero">
        <h1>Contact Us</h1>
        <p className="contact-lead">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="contact-content section-container--wide">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p>Feel free to reach out to us through any of these channels:</p>

            <div className="info-items">
              <div className="info-item">
                <div className="info-icon">
                  <span className="material-symbols-outlined">email</span>
                </div>
                <div>
                  <h3>Email</h3>
                  <p>support@{theme.brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <span className="material-symbols-outlined">phone</span>
                </div>
                <div>
                  <h3>Phone</h3>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h3>Address</h3>
                  <p>123 Commerce Street<br />Suite 100<br />San Francisco, CA 94102</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Friday: 9am - 6pm PST<br />Saturday - Sunday: 10am - 4pm PST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send Us a Message</h2>

            {submitted ? (
              <div className="success-message" role="status" aria-live="polite">
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" aria-label="Contact form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
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
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
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

                {/* Honeypot fields - hidden from users, bots will fill them */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                />

                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}