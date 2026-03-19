const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ token: sign(user), user: { id: user._id, name, email, role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user), user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
