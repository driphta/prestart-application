const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  briefing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Briefing',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  timeOn: {
    type: String,
    required: true
  },
  timeOff: {
    type: String
  },
  bac: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
