import SEO from '../../components/SEO';
import { theme } from '../../config/theme';
import '../../styles/LegalPages.css';

export default function ReturnPolicy() {
  const lastUpdated = 'January 17, 2025';

  return (
    <div className="legal-page">
      <SEO
        title="Return Policy"
        description={`Return Policy for ${theme.brandName}. Learn about our return, refund, and exchange process.`}
        type="website"
      />

      <div className="legal-container">
        <header className="legal-header">
          <h1>Return Policy</h1>
          <p className="legal-last-updated">Last updated: {lastUpdated}</p>
        </header>

        <nav className="legal-toc">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#overview">Return Policy Overview</a></li>
            <li><a href="#return-period">Return Period</a></li>
            <li><a href="#conditions">Return Conditions</a></li>
            <li><a href="#non-returnable">Non-Returnable Items</a></li>
            <li><a href="#process">How to Return an Item</a></li>
            <li><a href="#refunds">Refunds</a></li>
            <li><a href="#exchanges">Exchanges</a></li>
            <li><a href="#damaged">Damaged or Defective Items</a></li>
            <li><a href="#shipping-costs">Return Shipping Costs</a></li>
            <li><a href="#international">International Returns</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </nav>

        <section className="legal-content">
          <section id="overview">
            <h2>1. Return Policy Overview</h2>
            <p>
              At {theme.brandName}, we want you to be completely satisfied with your purchase. If for any reason you are not satisfied, we accept returns within 30 days of delivery for a full refund or exchange.
            </p>
            <p>
              We take great pride in the quality of our artwork and prints. All items are carefully inspected and packaged before shipping to ensure they arrive in perfect condition.
            </p>
          </section>

          <section id="return-period">
            <h2>2. Return Period</h2>
            <p>
              You have <strong>30 days</strong> from the date of delivery to initiate a return. Returns requested after 30 days from delivery cannot be accepted.
            </p>
            <p>
              The return period begins on the date you receive your order, as confirmed by the shipping carrier's delivery confirmation.
            </p>
            <p>
              To be eligible for a return, you must initiate the return request within the 30-day period by contacting us at {theme.company.supportEmail}.
            </p>
          </section>

          <section id="conditions">
            <h2>3. Return Conditions</h2>
            <p>
              To qualify for a return, the following conditions must be met:
            </p>

            <h3>3.1 Item Condition</h3>
            <ul>
              <li>The item must be in its original condition, unused, and undamaged</li>
              <li>All original packaging, protective materials, and documentation must be included</li>
              <li>The item must not show any signs of wear, use, or alteration</li>
              <li>Framed items must be returned with frame intact and undamaged</li>
              <li>Canvas wraps must have no holes, marks, or damage to the canvas or wooden frame</li>
            </ul>

            <h3>3.2 Packaging Requirements</h3>
            <ul>
              <li>Items must be securely packaged to prevent damage during return shipping</li>
              <li>Use the original packaging whenever possible</li>
              <li>If original packaging is not available, use equivalent protective materials</li>
              <li>We recommend using a tracked and insured shipping method</li>
            </ul>

            <h3>3.3 Documentation</h3>
            <ul>
              <li>Include your order number with your return</li>
              <li>Provide the return authorization number (RA#) we issue to you</li>
              <li>Include a brief note explaining the reason for your return</li>
            </ul>
          </section>

          <section id="non-returnable">
            <h2>4. Non-Returnable Items</h2>
            <p>
              The following items cannot be returned or exchanged:
            </p>

            <h3>4.1 Original Artwork</h3>
            <p>
              <strong>Original, one-of-a-kind artwork pieces are final sale and non-returnable.</strong> Due to the unique nature of original paintings and artwork, these items cannot be returned unless they arrive damaged or defective. We encourage you to contact us with any questions about an original piece before purchasing.
            </p>

            <h3>4.2 Custom Orders</h3>
            <ul>
              <li>Custom-commissioned artwork</li>
              <li>Personalized or custom-framed items</li>
              <li>Special orders made to your specifications</li>
              <li>Custom size prints not listed in our standard offerings</li>
            </ul>

            <h3>4.3 Other Non-Returnable Items</h3>
            <ul>
              <li>Digital downloads or digital products</li>
              <li>Gift cards</li>
              <li>Items marked as "Final Sale" at the time of purchase</li>
              <li>Items returned without prior authorization</li>
              <li>Items returned after 30 days from delivery</li>
            </ul>
          </section>

          <section id="process">
            <h2>5. How to Return an Item</h2>
            <p>
              Follow these steps to return an item:
            </p>

            <h3>Step 1: Contact Us</h3>
            <p>
              Email us at <a href={`mailto:${theme.company.supportEmail}`}>{theme.company.supportEmail}</a> with the following information:
            </p>
            <ul>
              <li>Your order number</li>
              <li>The item(s) you wish to return</li>
              <li>Reason for return</li>
              <li>Whether you prefer a refund or exchange</li>
            </ul>

            <h3>Step 2: Receive Return Authorization</h3>
            <p>
              We will review your request and, if approved, issue you a Return Authorization Number (RA#) within 1-2 business days. Do not ship your return without obtaining an RA# first, as unauthorized returns will not be accepted.
            </p>

            <h3>Step 3: Package Your Return</h3>
            <p>
              Carefully package your item(s) following the packaging requirements outlined in Section 3.2. Include:
            </p>
            <ul>
              <li>Your order number</li>
              <li>Return Authorization Number (RA#)</li>
              <li>Brief note explaining reason for return</li>
            </ul>

            <h3>Step 4: Ship Your Return</h3>
            <p>
              Ship your return to the address provided in your return authorization email. We recommend using a tracked and insured shipping method, as we cannot be responsible for items lost or damaged during return shipping.
            </p>

            <h3>Step 5: Confirmation</h3>
            <p>
              Once we receive your return, we will inspect the item(s) and send you an email confirmation. If your return is approved, we will process your refund or exchange within 5-7 business days.
            </p>
          </section>

          <section id="refunds">
            <h2>6. Refunds</h2>

            <h3>6.1 Refund Processing Time</h3>
            <p>
              Once we receive and inspect your returned item, we will process your refund within <strong>5-7 business days</strong>. Refunds will be issued to the original payment method used for the purchase.
            </p>

            <h3>6.2 Refund Amount</h3>
            <ul>
              <li><strong>Product Price:</strong> Full refund of the item price</li>
              <li><strong>Original Shipping:</strong> Non-refundable (unless the item was damaged or defective)</li>
              <li><strong>Return Shipping:</strong> Customer is responsible for return shipping costs (unless the item was damaged or defective)</li>
            </ul>

            <h3>6.3 When You'll Receive Your Refund</h3>
            <p>
              After we process your refund, the time it takes for the refund to appear in your account depends on your payment provider:
            </p>
            <ul>
              <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
              <li><strong>PayPal:</strong> 1-3 business days</li>
              <li><strong>Bank Transfer:</strong> 3-7 business days</li>
            </ul>

            <h3>6.4 Partial Refunds</h3>
            <p>
              In certain situations, only partial refunds may be granted:
            </p>
            <ul>
              <li>Items returned without original packaging</li>
              <li>Items showing signs of use or wear</li>
              <li>Items returned damaged due to improper packaging by customer</li>
              <li>Items returned after 30 days but within 60 days (at our discretion)</li>
            </ul>
          </section>

          <section id="exchanges">
            <h2>7. Exchanges</h2>

            <h3>7.1 Exchange Process</h3>
            <p>
              If you would like to exchange an item for a different size, style, or color, follow the return process outlined in Section 5 and indicate that you would like an exchange.
            </p>
            <p>
              Once we receive and approve your return, we will ship your replacement item. If there is a price difference, we will either charge or refund the difference.
            </p>

            <h3>7.2 Exchange Shipping</h3>
            <ul>
              <li>Customer is responsible for return shipping costs for exchanges</li>
              <li>We will cover the shipping cost for sending the replacement item</li>
              <li>If the exchange is due to our error or a defective item, we will cover all shipping costs</li>
            </ul>

            <h3>7.3 Exchange Availability</h3>
            <p>
              Exchanges are subject to product availability. If your desired exchange item is out of stock, we will offer a full refund or alternative product.
            </p>
          </section>

          <section id="damaged">
            <h2>8. Damaged or Defective Items</h2>

            <h3>8.1 Reporting Damage</h3>
            <p>
              If your item arrives damaged or defective, please contact us immediately at {theme.company.supportEmail} within 7 days of delivery. Include:
            </p>
            <ul>
              <li>Your order number</li>
              <li>Clear photos of the damage (both the item and packaging)</li>
              <li>Description of the issue</li>
            </ul>

            <h3>8.2 Damaged Item Resolution</h3>
            <p>
              For damaged or defective items, we will:
            </p>
            <ul>
              <li>Provide a prepaid return shipping label at no cost to you</li>
              <li>Ship a replacement item free of charge, or</li>
              <li>Issue a full refund (including original shipping costs)</li>
            </ul>

            <h3>8.3 Shipping Carrier Damage</h3>
            <p>
              If your item is damaged during shipping, we will work with the carrier to file a claim and ensure you receive a replacement or refund promptly. We package all items with extreme care, but sometimes damage can occur during transit.
            </p>
          </section>

          <section id="shipping-costs">
            <h2>9. Return Shipping Costs</h2>

            <h3>9.1 Standard Returns</h3>
            <p>
              For standard returns (change of mind, doesn't match expectations, etc.), the customer is responsible for return shipping costs. We recommend using a tracked and insured shipping method.
            </p>

            <h3>9.2 Our Error or Defective Items</h3>
            <p>
              If we shipped the wrong item, or if the item is damaged or defective, we will provide a prepaid return shipping label at no cost to you, and refund the original shipping cost.
            </p>

            <h3>9.3 Shipping Insurance</h3>
            <p>
              We highly recommend purchasing shipping insurance for your return, especially for high-value items. We cannot be held responsible for items lost or damaged during return shipping.
            </p>
          </section>

          <section id="international">
            <h2>10. International Returns</h2>

            <h3>10.1 International Return Policy</h3>
            <p>
              International orders can be returned following the same process as domestic returns. However, please note:
            </p>
            <ul>
              <li>Customer is responsible for all return shipping costs</li>
              <li>Customer is responsible for any customs fees, duties, or taxes incurred during return shipping</li>
              <li>We recommend using a tracked international shipping service</li>
              <li>International returns may take longer to process</li>
            </ul>

            <h3>10.2 International Refunds</h3>
            <p>
              Refunds for international orders will not include:
            </p>
            <ul>
              <li>Original international shipping costs</li>
              <li>Any customs duties or taxes paid at the time of delivery</li>
              <li>Currency conversion fees</li>
            </ul>
          </section>

          <section id="contact">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about our return policy or need assistance with a return, please contact our customer service team:
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
            <p>
              Our customer service team is available Monday through Friday, 9:00 AM - 5:00 PM PST, and will respond to all inquiries within 1-2 business days.
            </p>
          </section>
        </section>

        <footer className="legal-footer">
          <p>
            Thank you for choosing {theme.brandName}. We appreciate your business and strive to provide excellent customer service.
          </p>
        </footer>
      </div>
    </div>
  );
}
