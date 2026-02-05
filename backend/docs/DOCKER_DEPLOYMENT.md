# 🐳 Docker Quick Guide

Simple Docker setup for the Production Grade Backend API.

## 🚀 Quick Start (3 Steps)

```bash
# 1. Clone and setup
git clone https://github.com/mohdanas86/productionGradeBackend.git
cd productionGradeBackend

# 2. Create environment file
# Copy and edit .env with your values
cp .env.example .env

# 3. Build and run
docker build -t backend .
docker run -p 3000:3000 backend
```

**Done!** Your API runs at `http://localhost:3000`

## 📋 Environment Setup

Create `.env` file with:

```env
PORT=3000
NODE_ENV=production
MONGO_URL=mongodb://localhost:27017/production
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=*
```

## 🛠️ Basic Commands

### Build & Run
```bash
# Build image
docker build -t backend .

# Run container
docker run -p 3000:3000 backend

# Run in background
docker run -d -p 3000:3000 --name my-backend backend
```

### Manage Containers
```bash
# List running containers
docker ps

# View logs
docker logs my-backend

# Stop container
docker stop my-backend

# Remove container
docker rm my-backend
```

### Debug & Cleanup
```bash
# Enter container shell
docker exec -it my-backend sh

# Clean up everything
docker system prune -a
```

## 🐙 Docker Compose (Multi-Container)

For database + app setup, create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongodb:27017/production
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
```

Run with:
```bash
docker-compose up -d
```

## 🔧 Dockerfile Explained

```dockerfile
FROM node:20-alpine          # Lightweight Node.js
WORKDIR /src/app             # Set working directory
COPY package*.json ./        # Copy dependencies first
RUN npm ci --only=production # Install production deps only
COPY . .                     # Copy source code
RUN mkdir -p public/temp     # Create upload directory
EXPOSE 3000                  # Expose port
CMD ["node", "src/index.js"] # Run the app
```

**Why this setup?**
- ✅ Small image size (Alpine Linux)
- ✅ Fast builds (dependency caching)
- ✅ Production ready (no dev tools)
- ✅ Secure (minimal attack surface)

## 🚨 Troubleshooting

### Container won't start?
```bash
# Check logs
docker logs my-backend

# Run interactively to debug
docker run -it --rm backend sh
```

### Port 3000 already in use?
```bash
# Use different port
docker run -p 8000:3000 backend
```

### Database connection issues?
```bash
# For local MongoDB
MONGO_URL=mongodb://host.docker.internal:27017/production

# For Docker Compose
MONGO_URL=mongodb://mongodb:27017/production
```

### File uploads not working?
```bash
# Check temp directory
docker exec -it my-backend ls -la public/
```

## 🌍 Production Deployment

### 1. Build optimized image
```bash
docker build -t my-backend:v1.0 .
```

### 2. Push to registry
```bash
# Docker Hub
docker tag my-backend:v1.0 username/my-backend:v1.0
docker push username/my-backend:v1.0

# Or use Docker Compose for production
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Deploy to server
```bash
# Pull and run on server
docker pull username/my-backend:v1.0
docker run -d -p 3000:3000 username/my-backend:v1.0
```

## 📚 Useful Links

- [Docker Docs](https://docs.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)


---

**That's it!** Your backend is now containerized and ready to deploy anywhere. 🐳