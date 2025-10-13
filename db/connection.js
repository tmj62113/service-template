import { MongoClient } from 'mongodb';

let uri;
let dbName;
let client;
let clientPromise;

function initializeConnection() {
  if (clientPromise) return clientPromise;

  uri = process.env.MONGODB_URI;
  dbName = process.env.MONGODB_DB_NAME || 'ecommerce';

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // In production, use a singleton pattern to avoid multiple connections
  if (process.env.NODE_ENV === 'production') {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  } else {
    // In development, use a global variable to preserve the connection across hot reloads
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  }

  return clientPromise;
}

/**
 * Get database connection
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDatabase() {
  const promise = initializeConnection();
  const client = await promise;
  return client.db(dbName);
}

/**
 * Get a specific collection
 * @param {string} collectionName
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getCollection(collectionName) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

/**
 * Close database connection
 */
export async function closeConnection() {
  if (client) {
    await client.close();
  }
}

export { clientPromise };
