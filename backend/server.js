const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS
const allowedOrigins = [
  'https://prestart-app.azurewebsites.net',
  'https://green-pond-0e70dff00.3.azurestaticapps.net',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route for basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Site Pre-Start Briefing API', time: new Date().toISOString() });
});

// API health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is running',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

// Version route
app.get('/api/version', (req, res) => {
  let version = '1.0.0';
  try {
    const packageJson = require('./package.json');
    version = packageJson.version;
  } catch (err) {
    console.error('Error reading package.json:', err);
  }
  res.json({ version });
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
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    console.error('Validate token error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    console.log('Create user request:', userData);
    res.status(201).json({ ...userData, id: '654321' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    path: req.path
  });
});

// Serve the test API page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-api.html'));
});

// If iisnode is handling the process
if (process.env.WEBSITE_INSTANCE_ID) {
  // Log to file
  const logDir = process.env.LOG_DIR || path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir);
    } catch (err) {
      console.error('Error creating log directory:', err);
    }
  }
  
  const logPath = path.join(logDir, 'server.log');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });
  console.log = function() {
    const args = Array.from(arguments);
    const message = `${new Date().toISOString()} - ${args.join(' ')}\n`;
    logStream.write(message);
  };
  console.error = console.log;
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node.js version: ${process.version}`);
});

module.exports = app;
