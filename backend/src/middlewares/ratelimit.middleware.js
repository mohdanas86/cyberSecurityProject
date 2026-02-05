import rateLimit from 'express-rate-limit';
import {
  APIRATELIMIT_15MIN,
  AUTHRATELIMIT_30MIN,
  FILEUPLOADRATELIMIT_30MIN,
  HEALTHCHECKRATELIMIT_30MIN,
} from '../constants.js';

// general Api rate limit (100 requests per 15 minutes)
export const apiRateLimit = rateLimit({
  windowMs: APIRATELIMIT_15MIN, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// stricter rate limit for authentication routes (5 requests per minute)
export const authRateLimit = rateLimit({
  windowMs: AUTHRATELIMIT_30MIN, // 30 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message:
      'Too many login attempts from this IP, please try again after 30 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// file upload rate limit (10 requests per 30 minutes)
export const fileUploadRateLimit = rateLimit({
  windowMs: FILEUPLOADRATELIMIT_30MIN, // 30 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message:
      'Too many file upload requests from this IP, please try again after 30 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// health check rate limit (200 requests per 15 minutes)
export const healthCheckRateLimit = rateLimit({
  windowMs: HEALTHCHECKRATELIMIT_30MIN, // 30 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message:
      'Too many requests from this IP, please try again after 30 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
