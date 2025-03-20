const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/projects
// @desc    Create a project
// @access  Private/ProjectManager
router.post('/', auth, async (req, res) => {
  try {
    // Only project managers can create projects
    if (req.user.role !== 'project-manager') {
      return res.status(403).json({ message: 'Not authorized to create projects' });
    }
    
    const { name, location, client, description } = req.body;
    
    // Create new project
    const project = new Project({
      name,
      location,
      client,
      description,
      createdBy: req.user.id
    });
    
    await project.save();
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private/ProjectManager
router.put('/:id', auth, async (req, res) => {
  try {
    // Only project managers can update projects
    if (req.user.role !== 'project-manager') {
      return res.status(403).json({ message: 'Not authorized to update projects' });
    }
    
    const { name, location, client, description } = req.body;
    
    // Build project object
    const projectFields = {};
    if (name) projectFields.name = name;
    if (location) projectFields.location = location;
    if (client) projectFields.client = client;
    if (description) projectFields.description = description;
    
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    );
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private/ProjectManager
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only project managers can delete projects
    if (req.user.role !== 'project-manager') {
      return res.status(403).json({ message: 'Not authorized to delete projects' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.remove();
    
    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
