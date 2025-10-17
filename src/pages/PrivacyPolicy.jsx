import { theme } from '../config/theme';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const lastUpdated = 'January 2025';

  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-container">
        <header className="privacy-policy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {lastUpdated}</p>
        </header>

        <div className="privacy-policy-content">
          <section className="privacy-section">
            <h2>Introduction</h2>
            <p>
              Welcome to {theme.brandName}. We respect your privacy and are committed to protecting
              your personal data. This privacy policy will inform you about how we look after your
              personal data when you visit our website and tell you about your privacy rights and how
              the law protects you.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
            <ul>
              <li>
                <strong>Identity Data:</strong> includes first name, last name, username or similar
                identifier.
              </li>
              <li>
                <strong>Contact Data:</strong> includes email address, billing address, delivery
                address and telephone numbers.
              </li>
              <li>
                <strong>Transaction Data:</strong> includes details about payments to and from you and
                other details of products and services you have purchased from us.
              </li>
              <li>
                <strong>Technical Data:</strong> includes internet protocol (IP) address, browser type
                and version, time zone setting and location, browser plug-in types and versions,
                operating system and platform.
              </li>
              <li>
                <strong>Usage Data:</strong> includes information about how you use our website,
                products and services.
              </li>
              <li>
                <strong>Marketing and Communications Data:</strong> includes your preferences in
                receiving marketing from us and your communication preferences.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li>To process and deliver your order including managing payments and collecting money owed to us</li>
              <li>To manage our relationship with you including notifying you about changes to our terms or privacy policy</li>
              <li>To enable you to participate in surveys or contests</li>
              <li>To administer and protect our business and website (including troubleshooting, data analysis, testing)</li>
              <li>To deliver relevant website content and advertisements to you and measure the effectiveness of our advertising</li>
              <li>To use data analytics to improve our website, products/services, marketing, customer relationships and experiences</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function and cannot be switched off in
              our systems. They are usually only set in response to actions made by you which amount
              to a request for services, such as setting your privacy preferences, logging in or
              filling in forms.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies allow us to count visits and traffic sources so we can measure and improve
              the performance of our site. They help us to know which pages are the most and least
              popular and see how visitors move around the site. All information these cookies collect
              is aggregated and therefore anonymous.
            </p>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies may be set through our site by our advertising partners. They may be used
              by those companies to build a profile of your interests and show you relevant adverts on
              other sites. They do not store directly personal information, but are based on uniquely
              identifying your browser and internet device.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from
              being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
              In addition, we limit access to your personal data to those employees, agents,
              contractors and other third parties who have a business need to know.
            </p>
            <p>
              We use industry-standard SSL (Secure Socket Layer) encryption to protect your payment
              information. All payment transactions are processed through secure payment gateways and
              we do not store your complete payment card details.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Data Retention</h2>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes
              we collected it for, including for the purposes of satisfying any legal, accounting, or
              reporting requirements.
            </p>
            <p>
              To determine the appropriate retention period for personal data, we consider the amount,
              nature, and sensitivity of the personal data, the potential risk of harm from
              unauthorized use or disclosure of your personal data, the purposes for which we process
              your personal data and whether we can achieve those purposes through other means.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
            <ul>
              <li>
                <strong>Request access</strong> to your personal data (commonly known as a "data
                subject access request").
              </li>
              <li>
                <strong>Request correction</strong> of the personal data that we hold about you.
              </li>
              <li>
                <strong>Request erasure</strong> of your personal data.
              </li>
              <li>
                <strong>Object to processing</strong> of your personal data where we are relying on a
                legitimate interest.
              </li>
              <li>
                <strong>Request restriction of processing</strong> your personal data.
              </li>
              <li>
                <strong>Request transfer</strong> of your personal data to you or to a third party.
              </li>
              <li>
                <strong>Withdraw consent</strong> at any time where we are relying on consent to
                process your personal data.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Third-Party Links</h2>
            <p>
              Our website may include links to third-party websites, plug-ins and applications.
              Clicking on those links or enabling those connections may allow third parties to collect
              or share data about you. We do not control these third-party websites and are not
              responsible for their privacy statements.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Newsletter and Marketing</h2>
            <p>
              If you have subscribed to our newsletter, we will use your email address to send you
              updates about new products, special offers, and other information about {theme.brandName}.
              You can unsubscribe from our newsletter at any time by clicking the "unsubscribe" link
              at the bottom of any email we send you.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Children's Privacy</h2>
            <p>
              Our website is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian and
              you are aware that your child has provided us with personal data, please contact us.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last Updated" date at the
              top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to
              this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please
              contact us:
            </p>
            <ul className="contact-list">
              <li>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${theme.company.email}`}>{theme.company.email}</a>
              </li>
              {theme.company.phone && (
                <li>
                  <strong>Phone:</strong> {theme.company.phone}
                </li>
              )}
              <li>
                <strong>Address:</strong> {theme.company.address.street},{' '}
                {theme.company.address.city}, {theme.company.address.state}{' '}
                {theme.company.address.zip}, {theme.company.address.country}
              </li>
            </ul>
          </section>

          <section className="privacy-section gdpr-notice">
            <h2>GDPR Compliance</h2>
            <p>
              This Privacy Policy is designed to comply with the General Data Protection Regulation
              (GDPR) and other applicable data protection laws. If you are located in the European
              Economic Area (EEA), you have certain data protection rights under GDPR.
            </p>
            <p>
              We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use
              of your personal data. If you wish to be informed what personal data we hold about you
              and if you want it to be removed from our systems, please contact us at{' '}
              <a href={`mailto:${theme.company.email}`}>{theme.company.email}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
