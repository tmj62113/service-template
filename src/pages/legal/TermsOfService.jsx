import SEO from '../../components/SEO';
import { theme } from '../../config/theme';
import '../../styles/LegalPages.css';

export default function TermsOfService() {
  const lastUpdated = 'January 17, 2025';

  return (
    <div className="legal-page">
      <SEO
        title="Terms of Service"
        description={`Terms of Service for ${theme.brandName}. Please read these terms carefully before using our website and services.`}
        type="website"
      />

      <div className="legal-container">
        <header className="legal-header">
          <h1>Terms of Service</h1>
          <p className="legal-last-updated">Last updated: {lastUpdated}</p>
        </header>

        <nav className="legal-toc">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#acceptance">Acceptance of Terms</a></li>
            <li><a href="#changes">Changes to Terms</a></li>
            <li><a href="#use-of-service">Use of Service</a></li>
            <li><a href="#accounts">User Accounts</a></li>
            <li><a href="#products">Products and Pricing</a></li>
            <li><a href="#orders">Orders and Payment</a></li>
            <li><a href="#intellectual-property">Intellectual Property</a></li>
            <li><a href="#prohibited-uses">Prohibited Uses</a></li>
            <li><a href="#user-content">User-Generated Content</a></li>
            <li><a href="#disclaimers">Disclaimers</a></li>
            <li><a href="#limitation-liability">Limitation of Liability</a></li>
            <li><a href="#indemnification">Indemnification</a></li>
            <li><a href="#termination">Termination</a></li>
            <li><a href="#governing-law">Governing Law</a></li>
            <li><a href="#contact">Contact Information</a></li>
          </ul>
        </nav>

        <section className="legal-content">
          <section id="acceptance">
            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to {theme.brandName}. By accessing or using our website, mobile application, or any of our services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
            </p>
            <p>
              If you do not agree to these Terms, you may not access or use our Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
            <p>
              Please read these Terms carefully before using our Service. By using our Service, you represent that you are at least 18 years of age and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section id="changes">
            <h2>2. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If we make material changes, we will notify you by:
            </p>
            <ul>
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Sending you an email notification (for registered users)</li>
            </ul>
            <p>
              Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section id="use-of-service">
            <h2>3. Use of Service</h2>

            <h3>3.1 License to Use</h3>
            <p>
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use our Service for your personal, non-commercial use.
            </p>

            <h3>3.2 Restrictions</h3>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service without our express written permission</li>
              <li>Modify, adapt, translate, or create derivative works based on the Service</li>
              <li>Use any automated system (including robots, spiders, or scrapers) to access the Service</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use the Service to transmit any viruses, malware, or other harmful code</li>
            </ul>

            <h3>3.3 Service Availability</h3>
            <p>
              We strive to provide uninterrupted access to our Service, but we do not guarantee that the Service will always be available or error-free. We may suspend, withdraw, or restrict the availability of all or any part of our Service for business or operational reasons.
            </p>
          </section>

          <section id="accounts">
            <h2>4. User Accounts</h2>

            <h3>4.1 Account Creation</h3>
            <p>
              To access certain features of the Service, you may be required to create an account. When you create an account, you must provide accurate, complete, and current information.
            </p>

            <h3>4.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Ensure that you log out from your account at the end of each session</li>
            </ul>
            <p>
              We are not liable for any loss or damage arising from your failure to protect your account credentials.
            </p>

            <h3>4.3 Account Termination</h3>
            <p>
              You may delete your account at any time by contacting us at {theme.company.supportEmail}. We reserve the right to suspend or terminate your account if you violate these Terms.
            </p>
          </section>

          <section id="products">
            <h2>5. Products and Pricing</h2>

            <h3>5.1 Product Information</h3>
            <p>
              We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions, images, pricing, or other content on the Service is accurate, complete, reliable, current, or error-free.
            </p>

            <h3>5.2 Pricing</h3>
            <p>
              All prices are listed in {theme.booking.currency} and are subject to change without notice. We reserve the right to modify or discontinue services at any time.
            </p>

            <h3>5.3 Product Availability</h3>
            <p>
              All products are subject to availability. We cannot guarantee that all products displayed on the Service will be in stock at the time of your order. If a product is unavailable after you place an order, we will notify you and offer a refund or alternative product.
            </p>

            <h3>5.4 Original Artwork</h3>
            <p>
              Original artwork pieces are one-of-a-kind and sold on a first-come, first-served basis. Once sold, the original artwork cannot be reproduced or replaced.
            </p>
          </section>

          <section id="orders">
            <h2>6. Orders and Payment</h2>

            <h3>6.1 Order Acceptance</h3>
            <p>
              Your order is an offer to purchase products from us. We reserve the right to accept or decline your order for any reason, including product availability, errors in pricing or product information, or suspected fraud.
            </p>
            <p>
              You will receive an order confirmation email once your order is placed. This confirmation does not constitute acceptance of your order. We will send you a shipping confirmation email once your order has been accepted and shipped.
            </p>

            <h3>6.2 Payment</h3>
            <p>
              We accept payment via credit card, debit card, and other payment methods processed through our secure payment processor, Stripe. By providing payment information, you represent and warrant that:
            </p>
            <ul>
              <li>You are legally authorized to use the payment method</li>
              <li>The payment information you provide is accurate and complete</li>
              <li>You will pay all charges incurred by you or any users of your account</li>
            </ul>

            <h3>6.3 Payment Authorization</h3>
            <p>
              By placing an order, you authorize us to charge your payment method for the total amount of your order, including product price, applicable taxes, and shipping fees.
            </p>

            <h3>6.4 Order Cancellation</h3>
            <p>
              You may cancel your order within 24 hours of placing it by contacting us at {theme.company.supportEmail}. Once an order has been shipped, it cannot be cancelled but may be returned in accordance with our Return Policy.
            </p>

            <h3>6.5 Taxes</h3>
            <p>
              You are responsible for all applicable sales taxes, use taxes, value-added taxes (VAT), and other taxes, duties, and charges imposed by any governmental authority on your purchase.
            </p>
          </section>

          <section id="intellectual-property">
            <h2>7. Intellectual Property Rights</h2>

            <h3>7.1 Our Intellectual Property</h3>
            <p>
              The Service and its entire contents, features, and functionality (including but not limited to all artwork, images, text, displays, graphics, photographs, video, audio, design, compilation, and software) are owned by {theme.company.name}, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>

            <h3>7.2 Artwork Copyright</h3>
            <p>
              All original artwork and images displayed on the Service are the intellectual property of {theme.company.name} or Mark J Peterson. When you purchase a physical artwork or print, you acquire ownership of the physical item only, not the copyright or reproduction rights.
            </p>

            <h3>7.3 Limited Use Rights</h3>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service, except as follows:
            </p>
            <ul>
              <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
              <li>You may store files that are automatically cached by your web browser for display enhancement purposes</li>
              <li>You may print or download one copy of a reasonable number of pages of the Service for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
            </ul>

            <h3>7.4 Trademarks</h3>
            <p>
              The {theme.brandName} name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of {theme.company.name}. You may not use such marks without our prior written permission.
            </p>
          </section>

          <section id="prohibited-uses">
            <h2>8. Prohibited Uses</h2>
            <p>You may not use the Service for any of the following purposes:</p>
            <ul>
              <li>To violate any applicable local, state, national, or international law or regulation</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the Service</li>
              <li>To engage in any automated use of the system, such as using scripts to send comments or messages</li>
              <li>To impersonate or attempt to impersonate {theme.company.name}, an employee, another user, or any other person or entity</li>
            </ul>
          </section>

          <section id="user-content">
            <h2>9. User-Generated Content</h2>

            <h3>9.1 Your Responsibilities</h3>
            <p>
              The Service may allow you to submit reviews, comments, or other content ("User Content"). You are solely responsible for any User Content you post. By submitting User Content, you represent and warrant that:
            </p>
            <ul>
              <li>You own or have the necessary rights to post the User Content</li>
              <li>The User Content does not violate any intellectual property rights of others</li>
              <li>The User Content does not contain any unlawful, harmful, or offensive material</li>
              <li>The User Content complies with these Terms</li>
            </ul>

            <h3>9.2 License Grant</h3>
            <p>
              By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content in any media.
            </p>

            <h3>9.3 Moderation and Removal</h3>
            <p>
              We reserve the right (but not the obligation) to monitor, edit, or remove any User Content at our sole discretion. We may remove User Content that violates these Terms or is otherwise objectionable.
            </p>
          </section>

          <section id="disclaimers">
            <h2>10. Disclaimers</h2>

            <h3>10.1 No Warranties</h3>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF THE SERVICE OR CONTENT</li>
            </ul>

            <h3>10.2 Third-Party Services</h3>
            <p>
              The Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
            </p>
          </section>

          <section id="limitation-liability">
            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {theme.company.name.toUpperCase()}, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
            </p>
            <ul>
              <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from your access to or use of or inability to access or use the Service</li>
              <li>Damages resulting from any conduct or content of any third party on the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p>
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE ACTION GIVING RISE TO LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          <section id="indemnification">
            <h2>12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless {theme.company.name}, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your use of the Service</li>
              <li>Your violation of any rights of another</li>
              <li>Any User Content you submit</li>
            </ul>
          </section>

          <section id="termination">
            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your access to all or part of the Service immediately, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul>
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>At our discretion for any reason</li>
            </ul>
            <p>
              Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section id="governing-law">
            <h2>14. Governing Law and Dispute Resolution</h2>

            <h3>14.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Oregon, United States, without regard to its conflict of law provisions.
            </p>

            <h3>14.2 Dispute Resolution</h3>
            <p>
              Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, rather than in court, except that you may assert claims in small claims court if your claims qualify.
            </p>

            <h3>14.3 Class Action Waiver</h3>
            <p>
              You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
            </p>
          </section>

          <section id="contact">
            <h2>15. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
            By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </footer>
      </div>
    </div>
  );
}
