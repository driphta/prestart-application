const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Briefing = require('../models/Briefing');

// @route   GET /api/attendances
// @desc    Get all attendances (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let attendances;
    
    // Project managers can see all attendances
    if (req.user.role === 'project-manager') {
      attendances = await Attendance.find()
        .populate('briefing', ['date', 'location'])
        .populate('userId', ['name', 'email']);
    } else {
      // Get briefings created by the user
      const briefings = await Briefing.find({ createdBy: req.user.id });
      const briefingIds = briefings.map(briefing => briefing._id);
      
      // Site supervisors can only see attendances for briefings they created
      attendances = await Attendance.find({ briefing: { $in: briefingIds } })
        .populate('briefing', ['date', 'location'])
        .populate('userId', ['name', 'email']);
    }
    
    res.json(attendances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/attendances/briefing/:briefingId
// @desc    Get attendances by briefing ID
// @access  Private
router.get('/briefing/:briefingId', auth, async (req, res) => {
  try {
    const briefing = await Briefing.findById(req.params.briefingId);
    
    if (!briefing) {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    
    // Site supervisors can only view attendances for their own briefings
    if (req.user.role !== 'project-manager' && briefing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view attendances for this briefing' });
    }
    
    const attendances = await Attendance.find({ briefing: req.params.briefingId })
      .populate('userId', ['name', 'email']);
    
    res.json(attendances);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/attendances
// @desc    Create an attendance record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { briefing, userId, name, timeOn, timeOff, bac } = req.body;
    
    // Check if briefing exists
    const briefingExists = await Briefing.findById(briefing);
    if (!briefingExists) {
      return res.status(404).json({ message: 'Briefing not found' });
    }
    
    // Site supervisors can only create attendances for their own briefings
    if (req.user.role !== 'project-manager' && briefingExists.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create attendances for this briefing' });
    }
    
    // Create new attendance
    const attendance = new Attendance({
      briefing,
      userId,
      name,
      timeOn,
      timeOff,
      bac
    });
    
    await attendance.save();
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/attendances/:id
// @desc    Update an attendance record
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { timeOn, timeOff, bac } = req.body;
    
    // Build attendance object
    const attendanceFields = {};
    if (timeOn) attendanceFields.timeOn = timeOn;
    if (timeOff) attendanceFields.timeOff = timeOff;
    if (bac !== undefined) attendanceFields.bac = bac;
    
    let attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if user is authorized to update attendance
    const briefing = await Briefing.findById(attendance.briefing);
    if (req.user.role !== 'project-manager' && briefing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this attendance record' });
    }
    
    // Update attendance
    attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: attendanceFields },
      { new: true }
    );
    
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/attendances/:id
// @desc    Delete an attendance record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Check if user is authorized to delete attendance
    const briefing = await Briefing.findById(attendance.briefing);
    if (req.user.role !== 'project-manager' && briefing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this attendance record' });
    }
    
    await attendance.remove();
    
    res.json({ message: 'Attendance record removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
