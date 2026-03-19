const mongoose = require('mongoose');

const BurnoutSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  sprint:      { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  burnoutRisk: { type: String, enum: ['Low', 'Medium', 'High'] },
  confidence:  { type: Number },
  features:    { type: Object },
  recommendation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Burnout', BurnoutSchema);
