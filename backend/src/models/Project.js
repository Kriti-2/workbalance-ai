const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  manager:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
