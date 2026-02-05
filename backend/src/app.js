import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

// Trust proxy for rate limiting and security headers
app.set('trust proxy', 1);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, you might want to allow all localhost origins
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '16Kb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '16Kb',
  })
);
app.use(express.static('public'));
app.use(cookieParser());

// import routes here
import userRouter from './routes/user.routes.js';
import { healthCheckRateLimit } from './middlewares/ratelimit.middleware.js';
import { ApiError } from './utils/apiError.js';

// Use routes
app.use('/api/v1/user', userRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  let error = err;

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation Error',
      errors,
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `${field} already exists`,
      errors: [`${field} must be unique`],
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid token',
      errors: ['Token is invalid'],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Token expired',
      errors: ['Token has expired'],
    });
  }

  // Handle other errors
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
    errors: ['Internal server error'],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// home route for testing
app.get('/', (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Welcome to the Production-Grade Backend API',
      data: {
        message: 'API is running successfully',
        status: 'API is running successfully',
      },
    });
  } catch (error) {
    console.error('Error in home route:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
});

// api health
app.get('/api/v1/health', healthCheckRateLimit, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'API is healthy',
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'API is healthy',
      },
    });
  } catch (error) {
    console.error('Error in health check route:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }
});

export { app };
