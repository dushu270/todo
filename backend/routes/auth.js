const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');

// POST /api/auth/register - Register or update user after Firebase auth
router.post('/register', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    
    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    
    if (user) {
      // Update existing user
      user.email = email;
      user.displayName = name || user.displayName;
      user.photoURL = picture || user.photoURL;
      user.lastLoginAt = new Date();
      await user.save();
      
      return res.json({
        message: 'User updated successfully',
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      });
    }
    
    // Create new user
    user = new User({
      firebaseUid: uid,
      email: email,
      displayName: name,
      photoURL: picture,
      lastLoginAt: new Date()
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      message: error.message 
    });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Please register first'
      });
    }
    
    res.json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile', 
      message: error.message 
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Please register first'
      });
    }
    
    // Update allowed fields
    if (displayName !== undefined) user.displayName = displayName;
    if (photoURL !== undefined) user.photoURL = photoURL;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile', 
      message: error.message 
    });
  }
});

// POST /api/auth/verify - Verify token (for frontend to check auth status)
router.post('/verify', verifyFirebaseToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.emailVerified,
      name: req.user.name,
      picture: req.user.picture
    }
  });
});

module.exports = router; 