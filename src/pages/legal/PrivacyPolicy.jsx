import SEO from '../../components/SEO';
import { theme } from '../../config/theme';
import '../../styles/LegalPages.css';

export default function PrivacyPolicy() {
  const lastUpdated = 'January 17, 2025';

  return (
    <div className="legal-page">
      <SEO
        title="Privacy Policy"
        description={`Privacy Policy for ${theme.brandName}. Learn how we collect, use, and protect your personal information.`}
        type="website"
      />

      <div className="legal-container">
        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-last-updated">Last updated: {lastUpdated}</p>
        </header>

        <nav className="legal-toc">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#information-collection">Information We Collect</a></li>
            <li><a href="#information-use">How We Use Your Information</a></li>
            <li><a href="#information-sharing">Information Sharing</a></li>
            <li><a href="#cookies">Cookies and Tracking Technologies</a></li>
            <li><a href="#your-rights">Your Rights and Choices</a></li>
            <li><a href="#data-security">Data Security</a></li>
            <li><a href="#data-retention">Data Retention</a></li>
            <li><a href="#children">Children's Privacy</a></li>
            <li><a href="#international">International Users</a></li>
            <li><a href="#changes">Changes to This Policy</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </nav>

        <section className="legal-content">
          <section id="introduction">
            <h2>1. Introduction</h2>
            <p>
              Welcome to {theme.brandName}. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access our website or use our services.
            </p>
          </section>

          <section id="information-collection">
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide to Us</h3>
            <p>We collect information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Create an account or make a purchase</li>
              <li>Subscribe to our newsletter or marketing communications</li>
              <li>Contact us through our contact form or email</li>
              <li>Participate in surveys, contests, or promotions</li>
              <li>Leave reviews or comments on our website</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>Name and contact information (email address, phone number, mailing address)</li>
              <li>Payment information (processed securely through our payment processor)</li>
              <li>Account credentials (username and password)</li>
              <li>Order history and preferences</li>
              <li>Communication preferences</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>When you visit our website, we automatically collect certain information about your device and browsing activity, including:</p>
            <ul>
              <li>IP address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring/exit pages</li>
              <li>Date and time stamps</li>
              <li>Clickstream data</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>We may receive information about you from third-party sources, including:</p>
            <ul>
              <li>Payment processors (Stripe) for transaction verification</li>
              <li>Analytics providers for website usage statistics</li>
              <li>Social media platforms (if you choose to connect your accounts)</li>
            </ul>
          </section>

          <section id="information-use">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>

            <h3>3.1 To Provide and Maintain Our Services</h3>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping notifications</li>
              <li>Manage your account and preferences</li>
              <li>Provide customer support</li>
              <li>Process returns, exchanges, and refunds</li>
            </ul>

            <h3>3.2 To Improve Our Services</h3>
            <ul>
              <li>Analyze website usage and trends</li>
              <li>Develop new products and features</li>
              <li>Conduct research and analytics</li>
              <li>Optimize user experience</li>
            </ul>

            <h3>3.3 To Communicate With You</h3>
            <ul>
              <li>Send marketing and promotional communications (with your consent)</li>
              <li>Send important updates about your orders or account</li>
              <li>Respond to your inquiries and provide support</li>
              <li>Send newsletters and product updates (if subscribed)</li>
            </ul>

            <h3>3.4 For Legal and Security Purposes</h3>
            <ul>
              <li>Comply with legal obligations and regulations</li>
              <li>Prevent fraud and unauthorized access</li>
              <li>Protect our rights and property</li>
              <li>Enforce our Terms of Service</li>
            </ul>
          </section>

          <section id="information-sharing">
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information with third parties only in the following circumstances:</p>

            <h3>4.1 Service Providers</h3>
            <p>We share information with trusted third-party service providers who assist us in operating our website and conducting our business, including:</p>
            <ul>
              <li>Payment processors (Stripe) for secure payment processing</li>
              <li>Shipping carriers for order fulfillment</li>
              <li>Email service providers (Resend) for transactional and marketing emails</li>
              <li>Cloud storage providers (Cloudinary) for image hosting</li>
              <li>Analytics providers for website analytics</li>
            </ul>
            <p>These service providers are contractually obligated to protect your information and use it only for the purposes we specify.</p>

            <h3>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities, such as:</p>
            <ul>
              <li>Complying with a subpoena or court order</li>
              <li>Responding to law enforcement requests</li>
              <li>Protecting our rights, property, or safety</li>
              <li>Preventing fraud or illegal activities</li>
            </ul>

            <h3>4.3 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred to the acquiring entity.</p>

            <h3>4.4 With Your Consent</h3>
            <p>We may share your information for any other purpose with your explicit consent.</p>
          </section>

          <section id="cookies">
            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are small data files stored on your device.
            </p>

            <h3>5.1 Types of Cookies We Use</h3>
            <ul>
              <li><strong>Essential Cookies:</strong> Necessary for the website to function properly (e.g., shopping cart, authentication)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Track your browsing habits to deliver targeted advertising (with your consent)</li>
            </ul>

            <h3>5.2 Your Cookie Choices</h3>
            <p>
              Most web browsers are set to accept cookies by default. You can usually modify your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of our website.
            </p>
            <p>
              You can learn more about cookies and how to manage them at <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
            </p>
          </section>

          <section id="your-rights">
            <h2>6. Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>

            <h3>6.1 GDPR Rights (European Union)</h3>
            <p>If you are located in the European Union, you have the following rights:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data (right to be forgotten)</li>
              <li><strong>Right to Restrict Processing:</strong> Request restriction of processing your personal data</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data for marketing purposes</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent</li>
            </ul>

            <h3>6.2 CCPA Rights (California)</h3>
            <p>If you are a California resident, you have the following rights:</p>
            <ul>
              <li><strong>Right to Know:</strong> Request information about the personal data we collect and how we use it</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell personal information)</li>
              <li><strong>Right to Non-Discrimination:</strong> You will not be discriminated against for exercising your rights</li>
            </ul>

            <h3>6.3 Marketing Communications</h3>
            <p>
              You can opt-out of receiving marketing emails by clicking the "unsubscribe" link in any marketing email or by contacting us directly. Even if you opt-out of marketing communications, we will still send you transactional emails related to your orders and account.
            </p>

            <h3>6.4 Exercising Your Rights</h3>
            <p>
              To exercise any of these rights, please contact us at {theme.company.supportEmail}. We will respond to your request within 30 days.
            </p>
          </section>

          <section id="data-security">
            <h2>7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit (SSL/TLS)</li>
              <li>Secure payment processing through PCI-compliant providers (Stripe)</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section id="data-retention">
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <ul>
              <li><strong>Account Information:</strong> Retained until you request deletion or close your account</li>
              <li><strong>Order Information:</strong> Retained for 7 years for tax and accounting purposes</li>
              <li><strong>Marketing Preferences:</strong> Retained until you unsubscribe or request deletion</li>
              <li><strong>Analytics Data:</strong> Retained for 26 months in accordance with analytics provider policies</li>
            </ul>
          </section>

          <section id="children">
            <h2>9. Children's Privacy</h2>
            <p>
              Our website and services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at {theme.company.supportEmail}.
            </p>
            <p>
              If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to delete that information from our servers.
            </p>
          </section>

          <section id="international">
            <h2>10. International Users</h2>
            <p>
              Your information may be transferred to, stored, and processed in the United States and other countries where our service providers operate. These countries may have data protection laws that are different from the laws of your country.
            </p>
            <p>
              By using our website and services, you consent to the transfer of your information to countries outside of your country of residence, including the United States, which may have different data protection rules than your country.
            </p>
            <p>
              If you are located in the European Union, we ensure that appropriate safeguards are in place for such transfers, such as standard contractual clauses approved by the European Commission.
            </p>
          </section>

          <section id="changes">
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
            </p>
            <ul>
              <li>Posting the updated Privacy Policy on this page</li>
              <li>Updating the "Last updated" date at the top of this policy</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p>
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          <section id="contact">
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="legal-contact">
              <p><strong>{theme.company.name}</strong></p>
              <p>Email: <a href={`mailto:${theme.company.supportEmail}`}>{theme.company.supportEmail}</a></p>
              <p>Phone: <a href={`tel:${theme.company.phone}`}>{theme.company.phone}</a></p>
              <p>
                Address:<br />
                {theme.company.address.street}<br />
                {theme.company.address.city}, {theme.company.address.state} {theme.company.address.zip}<br />
                {theme.company.address.country}
              </p>
            </div>
          </section>
        </section>

        <footer className="legal-footer">
          <p>
            By using our website, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
          </p>
        </footer>
      </div>
    </div>
  );
}
