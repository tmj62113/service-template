import shippoPackage from "shippo";
import dotenv from 'dotenv';

// Ensure env variables are loaded
dotenv.config();

// Initialize Shippo SDK - access Shippo class from default export
const Shippo = shippoPackage.Shippo;
const shippoClient = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY });

/**
 * Create a shipment and purchase shipping label
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Shipment details with tracking info
 */
export async function createShipment(orderData) {
  try {
    const { shippingAddress, shippingName, orderId } = orderData;

    // Validate shipping address exists
    if (!shippingAddress) {
      throw new Error('No shipping address available for this order');
    }

    // Parse shipping address
    const addressParts = {
      name: shippingName || "Customer",
      street1: shippingAddress.line1 || "",
      street2: shippingAddress.line2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      zip: shippingAddress.postal_code || "",
      country: shippingAddress.country || "US",
    };

    // Create shipment with address and parcel info
    const shipment = await shippoClient.shipments.create({
      addressFrom: {
        name: "Your Store Name",
        street1: "14670 Travis St",
        city: "Overland Park",
        state: "KS",
        zip: "66223",
        country: "US",
        email: "tiffany.marie.jensen@gmail.com",
        phone: "555-123-4567",
      },
      addressTo: {
        name: addressParts.name,
        street1: addressParts.street1,
        street2: addressParts.street2,
        city: addressParts.city,
        state: addressParts.state,
        zip: addressParts.zip,
        country: addressParts.country,
      },
      parcels: [
        {
          length: "10",
          width: "8",
          height: "4",
          distanceUnit: "in",
          weight: "1",
          massUnit: "lb",
        },
      ],
      extra: {
        reference1: orderId,
      },
    });

    // Get the cheapest rate
    const rates = shipment.rates || [];
    if (rates.length === 0) {
      throw new Error("No shipping rates available");
    }

    const cheapestRate = rates.reduce((prev, current) =>
      parseFloat(prev.amount) < parseFloat(current.amount) ? prev : current
    );

    // Purchase the shipping label
    const transaction = await shippoClient.transactions.create({
      rate: cheapestRate.objectId,
      labelFileType: "PDF",
      async: false,
    });

    // Check transaction status
    if (transaction.status === 'ERROR') {
      const errorMessages = transaction.messages?.map(m => m.text || m.message).join(', ') || 'Unknown error';
      throw new Error(`Shippo transaction failed: ${errorMessages}`);
    }

    if (!transaction.trackingNumber) {
      throw new Error('No tracking number returned from Shippo. The label may be invalid or in ERROR status.');
    }

    // Return shipment details
    return {
      success: true,
      trackingNumber: transaction.trackingNumber,
      trackingUrlProvider: transaction.trackingUrlProvider,
      carrier: transaction.servicelevel?.name || cheapestRate.provider,
      shippingLabelUrl: transaction.labelUrl,
      shippoTransactionId: transaction.objectId,
      cost: transaction.rate,
      estimatedDays: cheapestRate.estimatedDays,
    };
  } catch (error) {
    console.error("Shippo error:", error);
    throw new Error(`Failed to create shipment: ${error.message}`);
  }
}

/**
 * Get tracking status for a shipment
 * @param {string} trackingNumber - Tracking number
 * @param {string} carrier - Carrier code
 * @returns {Promise<Object>} Tracking info
 */
export async function getTrackingStatus(trackingNumber, carrier) {
  try {
    const tracking = await shippoClient.tracks.get(carrier, trackingNumber);
    return {
      trackingNumber: tracking.trackingNumber,
      carrier: tracking.carrier,
      status: tracking.trackingStatus?.status,
      statusDetails: tracking.trackingStatus?.statusDetails,
      statusDate: tracking.trackingStatus?.statusDate,
      location: tracking.trackingStatus?.location,
      trackingHistory: tracking.trackingHistory || [],
    };
  } catch (error) {
    console.error("Tracking lookup error:", error);
    throw new Error(`Failed to get tracking status: ${error.message}`);
  }
}

/**
 * Validate an address
 * @param {Object} address - Address to validate
 * @returns {Promise<Object>} Validated address
 */
export async function validateAddress(address) {
  try {
    const validation = await shippoClient.addresses.create({
      name: address.name,
      street1: address.street1,
      street2: address.street2 || "",
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || "US",
      validate: true,
    });

    return {
      isValid: validation.validationResults?.isValid || false,
      messages: validation.validationResults?.messages || [],
      address: validation,
    };
  } catch (error) {
    console.error("Address validation error:", error);
    return {
      isValid: false,
      messages: [error.message],
      address: null,
    };
  }
}
