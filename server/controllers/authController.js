const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userCount = await User.countDocuments();
    if (userCount >= 3) {
      return res.status(400).json({ message: 'Registration disabled. Maximum of 3 users reached.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const role = userCount === 0 ? 'admin' : 'user';
    
    await User.create({ name, email, password: hash, role });
    res.status(201).json({ message: 'Successfully registered! You may now login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkConfig = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ maxReached: count >= 3 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
