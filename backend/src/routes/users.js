const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    // Only project managers can view all users
    if (req.user.role !== 'project-manager') {
      return res.status(403).json({ message: 'Not authorized to view all users' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Users can only view their own profile unless they are project managers
    if (req.user.role !== 'project-manager' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Users can only update their own profile unless they are project managers
    if (req.user.role !== 'project-manager' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    const { name, email, role } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    
    // Only project managers can update roles
    if (role && req.user.role === 'project-manager') {
      userFields.role = role;
    }
    
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only project managers can delete users
    if (req.user.role !== 'project-manager') {
      return res.status(403).json({ message: 'Not authorized to delete users' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.remove();
    
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
