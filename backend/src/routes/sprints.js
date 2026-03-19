const router = require('express').Router();
const auth = require('../middleware/auth');
const Sprint = require('../models/Sprint');

router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = projectId ? { project: projectId } : {};
    const sprints = await Sprint.find(query).populate('project', 'name');
    res.json(sprints);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    res.status(201).json(sprint);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate('project', 'name');
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });
    res.json(sprint);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sprint);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Sprint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sprint deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
