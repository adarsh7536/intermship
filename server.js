const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for external clients
app.use(cors());

// Parse incoming JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'DevBlog REST API Server',
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString()
  });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Direct convenience aliases matching assignment specification:
// - User Registration: /api/register
// - User Login:        /api/login
// - Create Blog:       /api/create-blog
app.post('/api/register', (req, res, next) => {
  req.url = '/register';
  authRoutes(req, res, next);
});

app.post('/api/login', (req, res, next) => {
  req.url = '/login';
  authRoutes(req, res, next);
});

app.post('/api/create-blog', (req, res, next) => {
  req.url = '/';
  blogRoutes(req, res, next);
});

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Specific page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all 404 for unmatched /api requests
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                   🚀 DevBlog Backend Server                      ║
╠═══════════════════════════════════════════════════════════════════╣
║  • Web Application:  http://localhost:${PORT}/                     ║
║  • REST API Base:    http://localhost:${PORT}/api                  ║
║  • Health Check:     http://localhost:${PORT}/api/health           ║
║                                                                   ║
║  REST Endpoints:                                                  ║
║  ✓ POST /api/auth/register  (or /api/register)                    ║
║  ✓ POST /api/auth/login     (or /api/login)                       ║
║  ✓ POST /api/blogs          (or /api/create-blog)                 ║
║  ✓ GET  /api/blogs          (List all blogs with search/category) ║
║  ✓ GET  /api/blogs/:id      (Get single blog detail)              ║
║  ✓ PUT  /api/blogs/:id      (Update blog)                         ║
║  ✓ DELETE /api/blogs/:id    (Delete blog)                         ║
║  ✓ POST /api/blogs/:id/like (Like blog)                           ║
║  ✓ POST /api/blogs/:id/comments (Comment on blog)                 ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
