import { theme } from '../config/theme';

export default function About() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About {theme.brandName}</h1>
        <p className="about-lead">
          We're passionate about bringing you the finest products with exceptional service
        </p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded with a vision to revolutionize online shopping, {theme.brandName} has been
            dedicated to curating the best products for our customers. We believe in quality,
            authenticity, and creating lasting relationships with our community.
          </p>
          <p>
            Every product in our collection is carefully selected to meet our high standards.
            We work directly with trusted manufacturers and artisans to ensure you receive
            nothing but the best.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            To provide an exceptional shopping experience by offering premium products,
            outstanding customer service, and a seamless online platform that makes shopping
            easy and enjoyable.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose Us</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Quality First</h3>
              <p>We never compromise on product quality. Every item meets our rigorous standards.</p>
            </div>
            <div className="value-item">
              <h3>Customer Focused</h3>
              <p>Your satisfaction is our priority. We're here to help every step of the way.</p>
            </div>
            <div className="value-item">
              <h3>Fast Shipping</h3>
              <p>Get your orders quickly with our efficient fulfillment and shipping process.</p>
            </div>
            <div className="value-item">
              <h3>Secure Shopping</h3>
              <p>Shop with confidence knowing your information is protected with industry-leading security.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>
            We're committed to sustainability and ethical business practices. We partner with
            suppliers who share our values and work to minimize our environmental impact.
          </p>
          <p>
            Thank you for choosing {theme.brandName}. We look forward to serving you and being
            part of your shopping journey.
          </p>
        </section>
      </div>
    </div>
  );
}