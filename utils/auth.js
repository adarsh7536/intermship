const crypto = require('crypto');

const SECRET_SALT = process.env.SECRET_SALT || 'devblog_internship_secret_salt_2026';

// Map of in-memory active sessions: token -> user
const activeSessions = new Map();

/**
 * Hash a plain text password with HMAC SHA-256
 */
function hashPassword(password) {
  if (!password) return '';
  return crypto.createHmac('sha256', SECRET_SALT).update(String(password)).digest('hex');
}

/**
 * Compare plain text password with hashed password
 */
function comparePassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

/**
 * Generate a cryptographically secure random session token
 */
function generateToken(user) {
  const token = 'devblog_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: Date.now()
  });
  return token;
}

/**
 * Verify a session token and return user if valid
 */
function verifyToken(token) {
  if (!token) return null;
  return activeSessions.get(token) || null;
}

/**
 * Revoke a session token
 */
function revokeToken(token) {
  if (token) {
    activeSessions.delete(token);
  }
}

/**
 * Generate avatar initials from full name
 */
function generateAvatar(name) {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  revokeToken,
  generateAvatar
};
