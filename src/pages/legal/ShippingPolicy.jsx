import SEO from '../../components/SEO';
import { theme, formatCurrency } from '../../config/theme';
import '../../styles/LegalPages.css';

export default function ShippingPolicy() {
  const lastUpdated = 'January 17, 2025';

  return (
    <div className="legal-page">
      <SEO
        title="Shipping Policy"
        description={`Shipping Policy for ${theme.brandName}. Learn about our shipping methods, delivery times, and shipping costs.`}
        type="website"
      />

      <div className="legal-container">
        <header className="legal-header">
          <h1>Shipping Policy</h1>
          <p className="legal-last-updated">Last updated: {lastUpdated}</p>
        </header>

        <nav className="legal-toc">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#overview">Shipping Overview</a></li>
            <li><a href="#processing">Processing Times</a></li>
            <li><a href="#methods">Shipping Methods</a></li>
            <li><a href="#domestic">Domestic Shipping (USA)</a></li>
            <li><a href="#international">International Shipping</a></li>
            <li><a href="#costs">Shipping Costs</a></li>
            <li><a href="#tracking">Order Tracking</a></li>
            <li><a href="#delivery">Delivery Information</a></li>
            <li><a href="#delays">Shipping Delays</a></li>
            <li><a href="#damaged">Lost or Damaged Shipments</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </nav>

        <section className="legal-content">
          <section id="overview">
            <h2>1. Shipping Overview</h2>
            <p>
              At {theme.brandName}, we take great care in packaging and shipping your artwork to ensure it arrives in perfect condition. All orders are professionally packaged with protective materials and shipped via trusted carriers.
            </p>
            <p>
              We currently ship to addresses within the United States and to select international destinations. Please note that shipping times and costs vary depending on your location and the shipping method selected.
            </p>
          </section>

          <section id="processing">
            <h2>2. Processing Times</h2>

            <h3>2.1 Standard Processing</h3>
            <p>
              Most orders are processed and shipped within <strong>1-3 business days</strong> after payment confirmation. Business days are Monday through Friday, excluding major holidays.
            </p>

            <h3>2.2 Print Orders</h3>
            <ul>
              <li><strong>Standard Prints:</strong> 1-3 business days</li>
              <li><strong>Canvas Prints:</strong> 3-5 business days</li>
              <li><strong>Framed Prints:</strong> 3-5 business days</li>
              <li><strong>Large Format Prints (over 24"):</strong> 5-7 business days</li>
            </ul>

            <h3>2.3 Original Artwork</h3>
            <p>
              Original artwork pieces are shipped within <strong>1-2 business days</strong> after purchase. Original pieces receive extra protective packaging and insurance.
            </p>

            <h3>2.4 Custom Orders</h3>
            <p>
              Custom or commissioned artwork may require additional processing time. We will provide an estimated completion date at the time of order confirmation.
            </p>

            <h3>2.5 High Volume Periods</h3>
            <p>
              During peak seasons (holidays, special promotions), processing times may be extended by 1-3 additional business days. We will notify you if your order will experience any delays.
            </p>
          </section>

          <section id="methods">
            <h2>3. Shipping Methods</h2>
            <p>
              We offer several shipping options to meet your needs:
            </p>

            <h3>3.1 Standard Shipping</h3>
            <ul>
              <li><strong>Carrier:</strong> USPS, UPS, or FedEx</li>
              <li><strong>Delivery Time:</strong> 5-7 business days after shipment</li>
              <li><strong>Tracking:</strong> Included</li>
              <li><strong>Insurance:</strong> Included up to $100</li>
            </ul>

            <h3>3.2 Expedited Shipping</h3>
            <ul>
              <li><strong>Carrier:</strong> UPS or FedEx</li>
              <li><strong>Delivery Time:</strong> 2-3 business days after shipment</li>
              <li><strong>Tracking:</strong> Included</li>
              <li><strong>Insurance:</strong> Included up to $500</li>
            </ul>

            <h3>3.3 Express Shipping</h3>
            <ul>
              <li><strong>Carrier:</strong> FedEx or UPS</li>
              <li><strong>Delivery Time:</strong> 1-2 business days after shipment</li>
              <li><strong>Tracking:</strong> Included</li>
              <li><strong>Insurance:</strong> Included up to $1,000</li>
            </ul>

            <h3>3.4 White Glove Delivery</h3>
            <p>
              For large or high-value original artwork (over $2,000), we offer white glove delivery service with:
            </p>
            <ul>
              <li>Professional art handlers</li>
              <li>Inside delivery and placement</li>
              <li>Packaging removal</li>
              <li>Full insurance coverage</li>
            </ul>
            <p>
              Contact us at <a href={`mailto:${theme.company.supportEmail}`}>{theme.company.supportEmail}</a> for a white glove delivery quote.
            </p>
          </section>

          <section id="domestic">
            <h2>4. Domestic Shipping (USA)</h2>

            <h3>4.1 Delivery Times</h3>
            <p>
              Estimated delivery times for domestic shipping within the United States (after processing):
            </p>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Shipping Method</th>
                  <th>Estimated Delivery</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Shipping</td>
                  <td>5-7 business days</td>
                </tr>
                <tr>
                  <td>Expedited Shipping</td>
                  <td>2-3 business days</td>
                </tr>
                <tr>
                  <td>Express Shipping</td>
                  <td>1-2 business days</td>
                </tr>
              </tbody>
            </table>

            <h3>4.2 Coverage Areas</h3>
            <p>
              We ship to all 50 US states, including Alaska and Hawaii. Please note that Alaska and Hawaii may require additional shipping time and costs.
            </p>

            <h3>4.3 P.O. Boxes</h3>
            <p>
              We can ship smaller items (unframed prints under 16" x 20") to P.O. Boxes via USPS. Larger items, framed prints, and canvas prints require a physical street address for delivery.
            </p>

            <h3>4.4 Military Addresses (APO/FPO)</h3>
            <p>
              We ship to APO/FPO/DPO addresses via USPS. Processing and delivery times may be extended for military addresses.
            </p>
          </section>

          <section id="international">
            <h2>5. International Shipping</h2>

            <h3>5.1 Available Countries</h3>
            <p>
              We currently ship to the following international destinations:
            </p>
            <ul>
              <li>Canada</li>
              <li>United Kingdom</li>
              <li>European Union member countries</li>
              <li>Australia</li>
              <li>New Zealand</li>
              <li>Japan</li>
            </ul>
            <p>
              If your country is not listed, please contact us at <a href={`mailto:${theme.company.supportEmail}`}>{theme.company.supportEmail}</a> to inquire about availability.
            </p>

            <h3>5.2 International Delivery Times</h3>
            <p>
              International shipping typically takes <strong>7-21 business days</strong> after processing, depending on the destination and customs clearance.
            </p>

            <h3>5.3 Customs and Duties</h3>
            <p>
              <strong>Important:</strong> International orders may be subject to customs duties, taxes, and fees imposed by the destination country. These charges are the responsibility of the recipient and are not included in our product prices or shipping costs.
            </p>
            <ul>
              <li>Customs policies vary by country</li>
              <li>You may be contacted by customs officials or the carrier for payment</li>
              <li>We declare the full value of all shipments as required by law</li>
              <li>We cannot undervalue items or mark items as "gifts" to avoid customs fees</li>
            </ul>

            <h3>5.4 International Restrictions</h3>
            <p>
              Some items may be restricted from international shipping due to size, weight, or import regulations. We will notify you if your order cannot be shipped internationally.
            </p>
          </section>

          <section id="costs">
            <h2>6. Shipping Costs</h2>

            <h3>6.1 Free Shipping</h3>
            <p>
              We offer <strong>free standard shipping</strong> on all domestic (USA) orders over {formatCurrency(theme.commerce.shippingThreshold)}.
            </p>

            <h3>6.2 Domestic Shipping Rates</h3>
            <p>
              For orders under {formatCurrency(theme.commerce.shippingThreshold)}, shipping costs are calculated at checkout based on:
            </p>
            <ul>
              <li>Item size and weight</li>
              <li>Destination</li>
              <li>Selected shipping method</li>
            </ul>
            <p>
              Typical shipping costs:
            </p>
            <ul>
              <li><strong>Small prints (up to 11" x 14"):</strong> $8.99 - $12.99</li>
              <li><strong>Medium prints (up to 24" x 36"):</strong> $14.99 - $24.99</li>
              <li><strong>Large prints or framed items:</strong> $29.99 - $49.99</li>
            </ul>

            <h3>6.3 International Shipping Rates</h3>
            <p>
              International shipping costs vary significantly by destination and item size. Rates are calculated at checkout and typically range from $29.99 to $99.99+.
            </p>

            <h3>6.4 Shipping Discounts</h3>
            <p>
              When ordering multiple items, we combine packages whenever possible to minimize shipping costs. The shipping discount is automatically applied at checkout.
            </p>
          </section>

          <section id="tracking">
            <h2>7. Order Tracking</h2>

            <h3>7.1 Tracking Information</h3>
            <p>
              All orders include tracking information. Once your order ships, you will receive:
            </p>
            <ul>
              <li>Shipping confirmation email with tracking number</li>
              <li>Direct link to track your package</li>
              <li>Estimated delivery date</li>
            </ul>

            <h3>7.2 Checking Your Order Status</h3>
            <p>
              You can track your order by:
            </p>
            <ul>
              <li>Clicking the tracking link in your shipping confirmation email</li>
              <li>Visiting the carrier's website and entering your tracking number</li>
              <li>Logging into your account on our website (if you have one)</li>
            </ul>

            <h3>7.3 Tracking Updates</h3>
            <p>
              Tracking information may take 24-48 hours to appear in the carrier's system after your order ships. If you do not see tracking updates after 48 hours, please contact us.
            </p>
          </section>

          <section id="delivery">
            <h2>8. Delivery Information</h2>

            <h3>8.1 Signature Requirements</h3>
            <p>
              Signature may be required for:
            </p>
            <ul>
              <li>Orders over $500</li>
              <li>Original artwork</li>
              <li>Large framed pieces</li>
              <li>International shipments</li>
            </ul>
            <p>
              If you won't be available to sign, you can:
            </p>
            <ul>
              <li>Pre-sign for the package through the carrier's website</li>
              <li>Request the carrier to leave the package at a specific location</li>
              <li>Arrange for pickup at a carrier location</li>
            </ul>

            <h3>8.2 Undeliverable Addresses</h3>
            <p>
              If your package is returned to us as undeliverable due to an incorrect or incomplete address, we will contact you to arrange re-shipment. You may be responsible for additional shipping costs.
            </p>

            <h3>8.3 Delivery Attempts</h3>
            <p>
              Carriers typically make 3 delivery attempts. If no one is available to receive the package after 3 attempts, it will be returned to us. We will contact you to arrange re-delivery.
            </p>

            <h3>8.4 Refused Packages</h3>
            <p>
              If you refuse delivery of your order, it will be returned to us. Once we receive the returned package, we will issue a refund minus the original shipping cost and a 15% restocking fee.
            </p>
          </section>

          <section id="delays">
            <h2>9. Shipping Delays</h2>

            <h3>9.1 Common Causes of Delays</h3>
            <p>
              While we strive to deliver your order on time, delays can occur due to:
            </p>
            <ul>
              <li>Weather conditions</li>
              <li>Natural disasters</li>
              <li>Carrier issues or backlogs</li>
              <li>Customs clearance (international orders)</li>
              <li>Incorrect or incomplete shipping address</li>
              <li>Peak holiday shipping periods</li>
            </ul>

            <h3>9.2 What We Do</h3>
            <p>
              If your order is delayed, we will:
            </p>
            <ul>
              <li>Monitor your shipment closely</li>
              <li>Contact the carrier on your behalf</li>
              <li>Keep you updated on the status</li>
              <li>Work to resolve the issue as quickly as possible</li>
            </ul>

            <h3>9.3 Delayed Delivery Refunds</h3>
            <p>
              We cannot offer refunds for delivery delays caused by the carrier or circumstances beyond our control. However, if your order is significantly delayed, please contact us and we will work to find a solution.
            </p>
          </section>

          <section id="damaged">
            <h2>10. Lost or Damaged Shipments</h2>

            <h3>10.1 Lost Packages</h3>
            <p>
              If your tracking information shows that your package was delivered but you did not receive it:
            </p>
            <ul>
              <li>Check with neighbors or household members</li>
              <li>Check all entrances and delivery locations</li>
              <li>Contact the carrier directly</li>
              <li>Wait 24 hours (sometimes packages are marked delivered before actual delivery)</li>
            </ul>
            <p>
              If your package cannot be located after 7 days, contact us at {theme.company.supportEmail}. We will file a claim with the carrier and ship a replacement or issue a refund.
            </p>

            <h3>10.2 Damaged Packages</h3>
            <p>
              If your package arrives damaged:
            </p>
            <ul>
              <li>Do not discard the packaging</li>
              <li>Take photos of the damaged package and item</li>
              <li>Contact us immediately at {theme.company.supportEmail}</li>
              <li>Provide your order number and photos</li>
            </ul>
            <p>
              We will arrange for a replacement shipment or full refund at no cost to you. All shipments are insured, and we will handle the claim process.
            </p>

            <h3>10.3 Insurance Coverage</h3>
            <p>
              All shipments include insurance:
            </p>
            <ul>
              <li><strong>Standard Shipping:</strong> Up to $100</li>
              <li><strong>Expedited Shipping:</strong> Up to $500</li>
              <li><strong>Express Shipping:</strong> Up to $1,000</li>
              <li><strong>Original Artwork:</strong> Full declared value</li>
            </ul>
            <p>
              Additional insurance can be purchased at checkout for high-value items.
            </p>
          </section>

          <section id="contact">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about shipping, or need assistance with your order, please contact our customer service team:
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
            Thank you for choosing {theme.brandName}. We are committed to ensuring your artwork arrives safely and on time.
          </p>
        </footer>
      </div>
    </div>
  );
}
