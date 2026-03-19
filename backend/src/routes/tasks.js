const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

router.get('/', auth, async (req, res) => {
  try {
    const { projectId, sprintId, assigneeId } = req.query;
    const query = {};
    if (projectId)  query.project  = projectId;
    if (sprintId)   query.sprint   = sprintId;
    if (assigneeId) query.assignee = assigneeId;
    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .populate('sprint', 'name')
      .populate('project', 'name');
    res.json(tasks);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, reporter: req.user.id });
    res.status(201).json(task);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const prev = await Task.findById(req.params.id);
    // Track reopens: Done → InProgress/Todo
    if (prev.status === 'Done' && req.body.status && req.body.status !== 'Done') {
      req.body.reopenCount = (prev.reopenCount || 0) + 1;
    }
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignee', 'name email');
    res.json(task);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
