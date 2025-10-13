# Email Setup Guide - Resend

This guide will help you set up Resend for sending order confirmation emails.

## Prerequisites

- Domain: `tiffanyjensenportfolio.com`
- Access to domain DNS settings

## Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Your Domain

1. Log in to [Resend Dashboard](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain: `tiffanyjensenportfolio.com`
4. Click **"Add"**

## Step 3: Verify Domain with DNS Records

Resend will provide you with DNS records to add to your domain. You'll need to add these records to verify domain ownership:

### DNS Records to Add:

1. **SPF Record** (TXT)
   - Name: `@` or `tiffanyjensenportfolio.com`
   - Value: (provided by Resend, looks like `v=spf1 include:resend.com ~all`)

2. **DKIM Records** (TXT)
   - Name: (provided by Resend, usually like `resend._domainkey`)
   - Value: (long string provided by Resend)

3. **DMARC Record** (TXT) - Optional but recommended
   - Name: `_dmarc`
   - Value: (provided by Resend)

### Where to Add DNS Records:

Go to your domain registrar (where you bought `tiffanyjensenportfolio.com`):
- **GoDaddy**: DNS Management → Add TXT Records
- **Namecheap**: Advanced DNS → Add New Record
- **Cloudflare**: DNS → Add record
- **Google Domains**: DNS → Custom records

### Verification Time:

- DNS changes can take **5 minutes to 48 hours** to propagate
- Resend will automatically verify once DNS records are detected
- You'll see a green checkmark when verified

## Step 4: Get API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Name it: `Production` or `E-commerce App`
4. Select permissions: **"Sending access"**
5. Click **"Add"**
6. **Copy the API key** (starts with `re_`)

## Step 5: Add API Key to Environment Variables

Add the API key to your `.env` file:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

⚠️ **Important**: Never commit your API key to git!

## Step 6: Configure Sender Email

The application is configured to send from:
```
orders@tiffanyjensenportfolio.com
```

If you want to use a different email address, update `server.js`:

```javascript
const { data, error } = await resend.emails.send({
  from: 'orders@tiffanyjensenportfolio.com', // Change this
  to: orderData.customerEmail,
  subject: `Order Confirmation - #${orderData._id.toString().slice(-8).toUpperCase()}`,
  html: emailHtml,
});
```

## Step 7: Test Email Sending

### Using Stripe Test Mode:

1. Make sure your server is running: `node server.js`
2. Make a test purchase using Stripe test card: `4242 4242 4242 4242`
3. Complete the checkout
4. Check your server logs for: `📧 Confirmation email sent:`
5. Check the customer's email inbox

### Check Resend Logs:

1. Go to [Resend Logs](https://resend.com/emails)
2. You'll see all sent emails with status
3. Click on an email to see full details

## Free Tier Limits

Resend free tier includes:
- **3,000 emails/month**
- **100 emails/day**
- 1 custom domain
- Email API access

For more volume, upgrade to a paid plan.

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly in `.env`
2. **Check Domain Verification**: Domain must be verified (green checkmark in Resend dashboard)
3. **Check Server Logs**: Look for error messages starting with `❌`
4. **Check Resend Logs**: View delivery status in Resend dashboard

### Domain Not Verifying

1. **Wait longer**: DNS changes can take up to 48 hours
2. **Check DNS records**: Use [MXToolbox](https://mxtoolbox.com/DNSLookup.aspx) to verify records are live
3. **Correct format**: Make sure DNS records are added exactly as specified by Resend

### Emails Going to Spam

1. **Complete domain verification**: Make sure all DNS records are added (SPF, DKIM, DMARC)
2. **Warm up domain**: Send to real addresses gradually
3. **Professional content**: Avoid spam trigger words
4. **Add unsubscribe link**: Include in email footer

## Production Checklist

Before going live:

- [ ] Domain verified with green checkmark
- [ ] All DNS records added (SPF, DKIM, DMARC)
- [ ] API key added to production `.env`
- [ ] Test email sent successfully
- [ ] Email renders correctly in Gmail, Outlook, Apple Mail
- [ ] Customer email address is correct
- [ ] Monitor Resend logs for first few orders

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Status Page**: [status.resend.com](https://status.resend.com)

## Email Template Customization

To customize the order confirmation email, edit:
```
/utils/emailTemplates.js
```

The template includes:
- Order number
- Order date
- Customer name
- Items with quantities and prices
- Total amount
- Shipping and billing addresses
- Support contact information
