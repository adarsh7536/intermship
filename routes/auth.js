const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { hashPassword, comparePassword, generateToken, revokeToken, generateAvatar } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, username, email, and password.'
      });
    }

    const trimmedName = String(name).trim();
    const trimmedUsername = String(username).trim().toLowerCase();
    const trimmedEmail = String(email).trim().toLowerCase();
    const plainPassword = String(password);

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Validate username format
    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters.'
      });
    }

    // Validate password length
    if (plainPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already registered
    const users = db.getUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Check if username already taken
    if (users.some(u => u.username.toLowerCase() === trimmedUsername)) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    // Create user object
    const newUser = {
      id: 'user-' + Date.now(),
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashPassword(plainPassword),
      avatar: generateAvatar(trimmedName),
      bio: '',
      createdAt: new Date().toISOString()
    };

    // Save to database
    db.saveUser(newUser);

    // Generate token
    const token = generateToken(newUser);

    // Return safe user representation (no password)
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      bio: newUser.bio,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: 'User registration successful!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during user registration: ' + err.message
    });
  }
});

/**
 * POST /api/auth/login
 * User login with email or username & password
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.'
      });
    }

    const identifier = String(email).trim().toLowerCase();
    const plainPassword = String(password);

    // Find user by email or username
    const user = db.findUserByEmailOrUsername(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password. Please try again.'
      });
    }

    // Compare password
    const isMatch = comparePassword(plainPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password. Please try again.'
      });
    }

    // Generate session token
    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio || ''
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during user login: ' + err.message
    });
  }
});

/**
 * GET /api/auth/me
 * Fetch profile of current logged-in user
 */
router.get('/me', requireAuth, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio || ''
    }
  });
});

/**
 * POST /api/auth/logout
 * Invalidate session token
 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    revokeToken(token);
  }
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = router;
