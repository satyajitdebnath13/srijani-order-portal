import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './models/index.js';
import logger from './utils/logger.js';
import performanceMonitor from './utils/performanceMonitor.js';
import cacheManager from './utils/cache.js';
import queryCache from './utils/queryCache.js';
import queryHelper from './utils/queryHelper.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import supportRoutes from './routes/support.routes.js';
import returnRoutes from './routes/return.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import videoRoutes from './routes/video.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Ultra-fast compression middleware
app.use(compression({
  level: 1, // Fastest compression level
  threshold: 512, // Compress responses larger than 512 bytes
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Skip compression for already compressed content
    if (req.url.includes('.js') || req.url.includes('.css') || req.url.includes('.png') || req.url.includes('.jpg')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', // Additional dev port
  'http://localhost:5173', // Vite dev server
  'https://srijani-order-portal.vercel.app'
];

// Add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Vercel preview URLs
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma']
}));

// Ultra-fast rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased limit for speed
  skipSuccessfulRequests: true, // Skip rate limiting for successful requests
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Use IP + User-Agent for better distribution
    return `${req.ip}-${req.get('User-Agent')}`;
  },
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  }
});
app.use('/api/', limiter);

// Ultra-fast body parser middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Pre-parse JSON for speed
    try {
      req.rawBody = buf;
    } catch (e) {
      // Ignore parsing errors for speed
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 // Increase parameter limit for speed
}));

// Performance monitoring middleware
app.use(performanceMonitor.requestMonitor());

// Ultra-fast query caching middleware
app.use(queryCache.cacheMiddleware(600)); // 10 minutes cache for speed

// Ultra-fast response headers middleware
app.use((req, res, next) => {
  // Add ultra-fast caching headers
  if (req.method === 'GET') {
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
      'ETag': `"${Date.now()}"`, // Simple ETag for speed
      'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });
  }
  
  // Add performance headers
  res.set({
    'X-Powered-By': 'Srijani-Backend',
    'X-Response-Time': Date.now(),
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=5, max=1000'
  });
  
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ultra-fast performance monitoring endpoints
app.get('/api/performance', async (req, res) => {
  try {
    const [metrics, cacheStats, queryStats] = await Promise.all([
      Promise.resolve(performanceMonitor.getPerformanceReport()),
      cacheManager.getStats(),
      queryHelper.getPerformanceStats()
    ]);

    res.json({
      ...metrics,
      cache: cacheStats,
      queries: queryStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

app.get('/api/performance/reset', (req, res) => {
  performanceMonitor.resetMetrics();
  res.json({ message: 'Performance metrics reset successfully' });
});

// Ultra-fast cache management endpoints
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await cacheManager.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

app.post('/api/cache/clear', async (req, res) => {
  try {
    await cacheManager.clear();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/video', videoRoutes);

// Static files (for uploads, invoices, etc.)
app.use('/uploads', express.static('uploads'));

// Serve static files from the frontend dist directory
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip health check
  if (req.path === '/health') {
    return next();
  }
  
  // Skip uploads
  if (req.path.startsWith('/uploads/')) {
    return next();
  }
  
  // Serve index.html for all other routes (SPA fallback)
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// 404 handler (for API routes only)
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync();
      logger.info('Database synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await db.sequelize.close();
  process.exit(0);
});

startServer();

export default app;

