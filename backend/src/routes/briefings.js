const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Briefing = require('../models/Briefing');
const Project = require('../models/Project');

// @route   GET /api/briefings
// @desc    Get all briefings (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let briefings;
    
    // Project managers can see all briefings
    if (req.user.role === 'project-manager') {
      briefings = await Briefing.find()
        .populate('project', ['name', 'location'])
        .populate('createdBy', ['name', 'email']);
    } else {
      // Site supervisors can only see briefings they created
      briefings = await Briefing.find({ createdBy: req.user.id })
        .populate('project', ['name', 'location'])
        .populate('createdBy', ['name', 'email']);
    }
    
    res.json(briefings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/briefings/:id
// @desc    Get briefing by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const briefing = await Briefing.findById(req.params.id)
      .populate('project', ['name', 'location'])
      .populate('createdBy', ['name', 'email']);
    
    if (!briefing) {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    
    // Site supervisors can only view their own briefings
    if (req.user.role !== 'project-manager' && briefing.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this briefing' });
    }
    
    res.json(briefing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/briefings
// @desc    Create a briefing
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { project, date, location, description, hazards, controls } = req.body;
    
    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Create new briefing
    const briefing = new Briefing({
      project,
      date,
      location,
      description,
      hazards,
      controls,
      createdBy: req.user.id
    });
    
    await briefing.save();
    
    res.json(briefing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/briefings/:id
// @desc    Update a briefing
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { project, date, location, description, hazards, controls } = req.body;
    
    // Build briefing object
    const briefingFields = {};
    if (project) briefingFields.project = project;
    if (date) briefingFields.date = date;
    if (location) briefingFields.location = location;
    if (description) briefingFields.description = description;
    if (hazards) briefingFields.hazards = hazards;
    if (controls) briefingFields.controls = controls;
    
    let briefing = await Briefing.findById(req.params.id);
    
    if (!briefing) {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    
    // Check if user is authorized to update briefing
    if (req.user.role !== 'project-manager' && briefing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this briefing' });
    }
    
    // Update briefing
    briefing = await Briefing.findByIdAndUpdate(
      req.params.id,
      { $set: briefingFields },
      { new: true }
    );
    
    res.json(briefing);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/briefings/:id
// @desc    Delete a briefing
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const briefing = await Briefing.findById(req.params.id);
    
    if (!briefing) {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    
    // Check if user is authorized to delete briefing
    if (req.user.role !== 'project-manager' && briefing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this briefing' });
    }
    
    await briefing.remove();
    
    res.json({ message: 'Briefing removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
