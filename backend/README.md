# Production-Grade Backend API

A robust and scalable backend API built with Node.js, Express, and MongoDB. This project implements industry-standard practices for authentication, file uploads, error handling, and API design.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing using bcrypt
  - Protected routes with middleware
  - Cookie-based token management

- **File Upload Management**
  - Multer middleware for handling multipart/form-data
  - Cloudinary integration for cloud storage
  - Support for avatar and cover image uploads
  - Automatic file cleanup on upload failure

- **Robust Error Handling**
  - Custom API error classes
  - Async handler wrapper for route handlers
  - Consistent error response format
  - Proper HTTP status codes

- **Database Design**
  - MongoDB with Mongoose ODM
  - Well-structured schemas with validation
  - Indexed fields for optimized queries
  - Relationship modeling (User, Video, Subscription)

- **Code Quality**
  - ES6+ modern JavaScript syntax
  - Prettier code formatting
  - Modular architecture
  - Clean code principles

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Utilities](#utilities)
- [Development](#development)

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5.x
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer & Cloudinary
- **Password Hashing:** Bcrypt
- **Environment Management:** dotenv
- **Code Formatting:** Prettier
- **Development:** Nodemon

## 📁 Project Structure

```
productionGradeBackend/
├── src/
│   ├── controllers/       # Route controllers
│   │   └── user.controllers.js
│   ├── db/               # Database configuration
│   │   └── index.js
│   ├── middlewares/      # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models/           # Mongoose models
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   └── subscription.model.js
│   ├── routes/           # API routes
│   │   └── user.routes.js
│   ├── utils/            # Utility functions
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js            # Express app configuration
│   ├── constants.js      # Application constants
│   └── index.js          # Application entry point
├── public/
│   └── temp/             # Temporary file storage
├── .env                  # Environment variables
├── .prettierrc           # Prettier configuration
├── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohdanas86/productionGradeBackend.git
   cd productionGradeBackend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section)

4. **Start the development server**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:8080` (or your specified PORT)

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/your-database-name
# For MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# CORS Configuration
CORS_ORIGIN=*

# JWT Configuration
ACCESS_TOKEN_SECRET=your-access-token-secret-key-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# File Upload Configuration
MAX_FILE_SIZE=10485760
```
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=*
```

**⚠️ Security Note:** Never commit your `.env` file to version control. Add it to `.gitignore`.

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### User Routes

| Method | Endpoint              | Description          | Auth Required |
| ------ | --------------------- | -------------------- | ------------- |
| POST   | `/user/register`      | Register a new user  | ❌            |
| POST   | `/user/login`         | Login user           | ❌            |
| POST   | `/user/logout`        | Logout user          | ✅            |
| POST   | `/user/refresh-token` | Refresh access token | ❌            |

### API Request Examples

#### 1. Register User

```bash
POST /api/v1/user/register
Content-Type: multipart/form-data

Fields:
- username: string (required)
- email: string (required)
- password: string (required)
- fullName: string (required)
- avatar: file (required)
- coverImage: file (optional)
```

#### 2. Login User

```bash
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Logout User

```bash
POST /api/v1/user/logout
Authorization: Bearer <access_token>
Cookie: accessToken=<token>
```

#### 4. Refresh Access Token

```bash
POST /api/v1/user/refresh-token
Cookie: refreshToken=<refresh_token>

OR

{
  "refreshToken": "<refresh_token>"
}
```

## 📊 Database Models

### User Model

```javascript
{
  username: String (unique, indexed)
  email: String (unique)
  fullName: String (indexed)
  avatar: String (Cloudinary URL)
  coverImage: String (Cloudinary URL)
  watchHistory: [Video ObjectId]
  password: String (hashed)
  refreshToken: String
  timestamps: true
}
```

### Video Model

```javascript
{
  videoFile: String (Cloudinary URL)
  thumbnail: String (Cloudinary URL)
  title: String
  description: String
  duration: Number
  views: Number
  isPublished: Boolean
  owner: User ObjectId
}
```

### Subscription Model

```javascript
{
  subscriber: User ObjectId
  channel: User ObjectId
  timestamps: true
}
```

## 🛡️ Middleware

### 1. Authentication Middleware (`verifyJWT`)

Verifies JWT tokens from cookies or Authorization header. Protects routes that require authentication.

**Usage:**

```javascript
router.post('/protected-route', verifyJWT, controller);
```

### 2. File Upload Middleware (`upload`)

Handles file uploads using Multer with disk storage configuration.

**Usage:**

```javascript
router.post(
  '/upload',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  controller
);
```

## 🔧 Utilities

### `asyncHandler`

Wraps async route handlers to catch errors and pass them to Express error handlers.

### `ApiError`

Custom error class for consistent error handling with HTTP status codes.

### `ApiResponse`

Standardized API response format for successful requests.

### `cloudinary`

Handles file uploads to Cloudinary cloud storage with automatic cleanup.

## 💻 Development

### Available Scripts

```bash
# Start development server with nodemon
npm start

# Format code with Prettier (auto-fix)
npm run format

# Check code formatting (CI/CD)
npm run format:check
```

### Code Formatting

This project uses Prettier for code formatting. Configuration is in `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "lf"
}
```

**Before committing:**
```bash
npm run format
```

This ensures your code passes the CI formatting checks.

### Continuous Integration

This project uses GitHub Actions for automated code quality checks:

- ✅ **Prettier Formatting** - Ensures code style consistency
- ✅ **Dependency Installation** - Validates package integrity
- ✅ **Node.js 20.x** - Tests against production Node version

The CI pipeline runs automatically on:
- Every push to `main` branch
- Every pull request to `main` branch

**View workflow status:** [Actions tab](https://github.com/mohdanas86/productionGradeBackend/actions)

## 🏗️ Architecture Patterns

### MVC Pattern

- **Models:** Database schemas and business logic
- **Views:** JSON responses (API)
- **Controllers:** Request handling and response logic

### Middleware Pattern

- Authentication and authorization
- Error handling
- File upload processing

### Repository Pattern

- Database operations abstracted through Mongoose models
- Reusable query methods

## 🔒 Security Features

- **Password Security:** Bcrypt hashing with salt rounds
- **JWT Authentication:** Separate access and refresh tokens
- **HTTP-only Cookies:** Secure token storage
- **CORS Configuration:** Controlled cross-origin access
- **Input Validation:** Schema-level validation with Mongoose
- **Error Sanitization:** No sensitive data in error responses

## 📝 Best Practices Implemented

- ✅ Environment-based configuration
- ✅ Modular code organization
- ✅ Async/await error handling
- ✅ Database connection management
- ✅ Token refresh mechanism
- ✅ File upload validation
- ✅ Consistent API responses
- ✅ Code formatting standards
- ✅ Separation of concerns

## Docker Deployment

This project includes Docker support for easy containerization and deployment.

### Prerequisites

- Docker installed on your system
- Docker Compose (recommended for full setup with MongoDB)

### Quick Start with Docker Compose (Recommended)

1. Create a `.env` file with your environment variables (see Environment Variables section)
2. Run the application with MongoDB:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:8080`

### Environment Variables for Docker

Create a `.env` file in the root directory:

```env
# Application
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://mongodb:27017/productiongradebackend

# Security
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS
CORS_ORIGIN=*
```

### Manual Docker Build

```bash
# Build the image
docker build -t production-backend .

# Run the container with environment file
docker run -p 8080:8080 --env-file .env production-backend
```

### Docker Commands

```bash
# Build the image
docker build -t production-backend .

# Run in detached mode (background)
docker run -d -p 8080:8080 --env-file .env --name backend-container production-backend

# View logs
docker logs backend-container

# Stop the container
docker stop backend-container

# Remove the container
docker rm backend-container

# Remove the image
docker rmi production-backend
```

### Environment Variables in Docker

Create a `.env` file in your project root before building:

```env
PORT=3000
NODE_ENV=production
MONGO_URL=mongodb://host.docker.internal:27017/production
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=*
```

### Docker Image Details

- **Base Image:** `node:20-alpine` (lightweight Node.js image)
- **Working Directory:** `/src/app`
- **Exposed Port:** 3000
- **Production Optimized:** Only production dependencies installed
- **File Uploads:** Temporary directory created automatically

### Troubleshooting Docker Issues

**Port already in use:**
```bash
# Use a different port
docker run -p 8000:3000 production-backend
```

**Environment variables not loading:**
```bash
# Ensure .env file exists in the build context
ls -la .env
```

**Container exits immediately:**
```bash
# Check logs for errors
docker logs <container-name>
```

For detailed Docker documentation, see [`docs/DOCKER_DEPLOYMENT.md`](docs/DOCKER_DEPLOYMENT.md)

## 🚀 Deployment Considerations

### Pre-deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure CORS for production domain
- [ ] Set up MongoDB Atlas with IP whitelist
- [ ] Configure Cloudinary production environment
- [ ] Enable HTTPS
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Add input sanitization
- [ ] Set up error tracking (e.g., Sentry)

### Recommended Platforms

- **Backend:** Heroku, Railway, DigitalOcean, AWS EC2
- **Database:** MongoDB Atlas
- **File Storage:** Cloudinary
- **Environment Variables:** Platform-specific secret management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Mohd Anas**

- GitHub: [@mohdanas86](https://github.com/mohdanas86)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the robust database
- Cloudinary for seamless file management
- All open-source contributors

---

**Note:** This is a production-grade backend starter template. Customize it according to your specific requirements.

For issues and feature requests, please open an issue on GitHub.
