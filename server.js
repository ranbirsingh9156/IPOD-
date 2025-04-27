const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/taskmanager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Models
const User = mongoose.model('User', {
  username: String,
  password: String
});

const Task = mongoose.model('Task', {
  userId: String,
  title: String,
  description: String,
  completed: Boolean,
  createdAt: { type: Date, default: Date.now }
});

// Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, 'SECRET_KEY');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send('User created');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (!user) return res.status(400).send('User not found');
  if (!await bcrypt.compare(password, user.password)) 
    return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ _id: user._id }, 'SECRET_KEY');
  res.json({ token });
});

// Task Routes
app.get('/tasks', authenticate, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.json(tasks);
});

app.post('/tasks', authenticate, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user._id });
  await task.save();
  res.status(201).json(task);
});

app.put('/tasks/:id', authenticate, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

app.delete('/tasks/:id', authenticate, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.send('Task deleted');
});

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));