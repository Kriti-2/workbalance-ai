const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Burnout = require('../models/Burnout');
const Project = require('../models/Project');

const RECOMMENDATIONS = {
  Low:    'Team member is performing well. Maintain current workload.',
  Medium: 'Consider reducing task load by 20-30%. Schedule a 1:1 check-in this week.',
  High:   'Immediate action needed: reassign overdue tasks, reduce sprint scope, and arrange urgent check-in.'
};

// Compute features for a user in a sprint
async function computeFeatures(userId, sprintId, projectId) {
  const query = { assignee: userId };
  if (sprintId)  query.sprint  = sprintId;
  if (projectId) query.project = projectId;

  const tasks = await Task.find(query);
  const now = new Date();

  const assigned   = tasks.length;
  const completed  = tasks.filter(t => t.status === 'Done').length;
  const overdue    = tasks.filter(t => t.isOverdue || (t.dueDate && t.dueDate < now && t.status !== 'Done')).length;
  const carryover  = tasks.filter(t => t.isCarryover).length;
  const bugReopened = tasks.reduce((s, t) => s + (t.reopenCount || 0), 0);
  const doneTasks  = tasks.filter(t => t.completionHours > 0);
  const avgHrs     = doneTasks.length
    ? parseFloat((doneTasks.reduce((s, t) => s + t.completionHours, 0) / doneTasks.length).toFixed(2))
    : 0;
  const pressure   = assigned > 0 ? parseFloat(((assigned - completed) / assigned).toFixed(2)) : 0;

  // Rule-based risk override based on clear signals
  let riskOverride = null;
  if (assigned >= 12 && overdue >= 5) riskOverride = 'High';
  else if (assigned >= 7 && overdue >= 2) riskOverride = 'Medium';
  else if (assigned === 0) riskOverride = 'Low';

  return {
    tasks_assigned:     assigned,
    tasks_completed:    completed,
    overdue_tasks:      overdue,
    carryover_tasks:    carryover,
    avg_completion_hrs: avgHrs || (assigned > 0 && completed === 0 ? 12 : 0),
    bug_reopened:       bugReopened,
    sprint_pressure:    pressure,
    _riskOverride:      riskOverride
  };
}

// Predict burnout for one user
router.post('/predict/:userId', auth, async (req, res) => {
  try {
    const { sprintId, projectId } = req.body;
    const features = await computeFeatures(req.params.userId, sprintId, projectId);

    const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
      userId: req.params.userId,
      ...features
    });

    const { burnoutRisk, confidence } = mlRes.data;
    const record = await Burnout.create({
      user:        req.params.userId,
      project:     projectId,
      sprint:      sprintId,
      burnoutRisk,
      confidence,
      features,
      recommendation: RECOMMENDATIONS[burnoutRisk]
    });

    res.json({ ...record.toObject(), features });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Predict burnout for all members in a project
router.post('/predict-project/:projectId', auth, async (req, res) => {
  try {
    const { sprintId } = req.body;
    const project = await Project.findById(req.params.projectId).populate('members');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const allUsers = [project.manager, ...project.members.map(m => m._id || m)];
    const results = [];

    for (const userId of allUsers) {
      const features = await computeFeatures(userId, sprintId, req.params.projectId);
      try {
        const mlRes = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
          userId: userId.toString(), ...features
        });
        let { burnoutRisk, confidence } = mlRes.data;
        // Apply rule-based override if signals are very clear
        if (features._riskOverride) {
          burnoutRisk = features._riskOverride;
          confidence = 0.95;
        }
        delete features._riskOverride;
        const record = await Burnout.findOneAndUpdate(
          { user: userId, project: req.params.projectId },
          { burnoutRisk, confidence, features, recommendation: RECOMMENDATIONS[burnoutRisk], sprint: sprintId },
          { upsert: true, new: true }
        ).populate('user', 'name email role');
        const populated = record;
        results.push({
          user: populated.user,
          burnoutRisk, confidence, features,
          recommendation: RECOMMENDATIONS[burnoutRisk]
        });
      } catch (err) {
        results.push({ userId, error: err.message });
      }
    }

    res.json(results);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get burnout history for a user
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const records = await Burnout.find({ user: req.params.userId })
      .sort({ createdAt: -1 }).limit(20)
      .populate('sprint', 'name').populate('project', 'name');
    res.json(records);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get latest burnout for entire project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('members', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Get unique users: manager + members only (no duplicates)
    const memberIds = project.members.map(m => String(m._id));
    const managerId = String(project.manager);
    const uniqueUserIds = [...new Set([managerId, ...memberIds])];
    const results = [];
    for (const uid of uniqueUserIds) {
      const latest = await Burnout.findOne({ user: uid, project: req.params.projectId })
        .sort({ createdAt: -1 }).populate('user', 'name email role');
      if (latest) results.push(latest);
    }
    res.json(results);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
