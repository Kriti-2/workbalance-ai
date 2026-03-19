const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  sprint:      { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  assignee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporter:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['Todo', 'InProgress', 'Done'], default: 'Todo' },
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate:     { type: Date },
  completedAt: { type: Date },
  isOverdue:   { type: Boolean, default: false },
  isCarryover: { type: Boolean, default: false },
  reopenCount: { type: Number, default: 0 },
  completionHours: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-set completedAt & completionHours when marked Done
TaskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Done' && !this.completedAt) {
    this.completedAt = new Date();
    const hours = (this.completedAt - this.createdAt) / 3600000;
    this.completionHours = Math.round(hours * 10) / 10;
  }
  if (this.dueDate && this.status !== 'Done' && new Date() > this.dueDate) {
    this.isOverdue = true;
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
