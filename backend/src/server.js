const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));

// Basic routes for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Site Pre-Start Briefing API' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Register request:', { name, email, role });
    res.status(201).json({ 
      user: { name, email, role, id: '123456' },
      token: 'test-token-123456'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email });
    res.json({ 
      user: { name: 'Test User', email, role: 'site-supervisor', id: '123456' },
      token: 'test-token-123456'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/validate-token', (req, res) => {
  try {
    const { token } = req.body;
    console.log('Validate token request:', { token });
    if (token === 'test-token-123456') {
      res.json({ name: 'Test User', email: 'testuser@example.com', role: 'site-supervisor', id: '123456' });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.get('/api/users', (req, res) => {
  try {
    res.json([
      { name: 'Test User 1', email: 'testuser1@example.com', role: 'site-supervisor', id: '123456' },
      { name: 'Test User 2', email: 'testuser2@example.com', role: 'project-manager', id: '789012' }
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    console.log('Create user request:', userData);
    res.status(201).json({ ...userData, id: '654321' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Project routes
app.get('/api/projects', (req, res) => {
  try {
    res.json([
      { name: 'Test Project 1', location: 'Test Location 1', description: 'Test Description 1', id: '123' },
      { name: 'Test Project 2', location: 'Test Location 2', description: 'Test Description 2', id: '456' }
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const projectData = req.body;
    console.log('Create project request:', projectData);
    res.status(201).json({ ...projectData, id: '789' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log('Get project request:', { id });
    res.json({ name: 'Test Project', location: 'Test Location', description: 'Test Description', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
