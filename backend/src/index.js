import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { app } from './app.js';
import databaseconnection from './db/index.js';
import { apiRateLimit } from './middlewares/ratelimit.middleware.js';

// Apply general rate limit to all API routes
app.use('/api', apiRateLimit);

// database connection
databaseconnection()
  .then(() => {
    http.createServer(app).listen(process.env.PORT || 8080, () => {
      console.log(`Server running on port ${process.env.PORT || 8080}`);
    });
  })
  .catch((error) => console.error('Database connection failed:', error));
