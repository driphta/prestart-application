const mongoose = require('mongoose');

const BriefingSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  hazards: {
    type: [String],
    required: true
  },
  controls: {
    type: [String],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Briefing', BriefingSchema);
