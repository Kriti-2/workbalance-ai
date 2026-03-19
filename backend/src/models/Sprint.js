const mongoose = require('mongoose');

const SprintSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  goal:      { type: String },
  status:    { type: String, enum: ['Planning', 'Active', 'Completed'], default: 'Planning' },
}, { timestamps: true });

module.exports = mongoose.model('Sprint', SprintSchema);
