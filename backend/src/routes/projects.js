const router = require('express').Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Get all projects for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ manager: req.user.id }, { members: req.user.id }]
    }).populate('manager', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, manager: req.user.id });
    res.status(201).json(project);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const p = await Project.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('members', 'name email');
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Add member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.body.userId } },
      { new: true }
    ).populate('members', 'name email');
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
