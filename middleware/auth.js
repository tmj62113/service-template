import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';

// Helper function to get JWT_SECRET
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Middleware to verify JWT token and protect routes
 */
export async function authenticateToken(req, res, next) {
  try {
    // Get token from cookie
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, getJWTSecret());

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export function generateToken(userId) {
  return jwt.sign(
    { userId },
    getJWTSecret(),
    { expiresIn: '7d' } // Token expires in 7 days
  );
}
