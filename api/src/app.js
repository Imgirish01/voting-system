const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const voterRoutes = require('./routes/voter.routes');
const candidateRoutes = require('./routes/candidate.routes');
const electionRoutes = require('./routes/election.routes');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'E-Voters Commission API Portal',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes (support both /api/* and direct routes for Vercel rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/voters', voterRoutes);
app.use('/voters', voterRoutes);

app.use('/api/candidates', candidateRoutes);
app.use('/candidates', candidateRoutes);

app.use('/api/elections', electionRoutes);
app.use('/elections', electionRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;

