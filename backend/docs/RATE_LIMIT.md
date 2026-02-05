# API Rate Limiting

## What is Rate Limiting?

Rate limiting controls how many requests a user can make to your API in a given time period. It prevents abuse and ensures fair usage.

## Why Use Rate Limiting?

- Protects your server from too many requests
- Prevents spam and abuse
- Ensures fair access for all users
- Improves server performance and stability

## How It Works

The system tracks requests by IP address and blocks requests that exceed the limit. When the limit is reached, the API returns an error response.

## Rate Limit Types

### General API Limit
- **Limit**: 100 requests per 15 minutes
- **Applies to**: All API endpoints
- **Purpose**: Basic protection for all routes

### Authentication Limit
- **Limit**: 5 attempts per hour
- **Applies to**: Login and registration endpoints
- **Purpose**: Prevents brute force attacks

### Upload Limit
- **Limit**: 10 uploads per hour
- **Applies to**: File upload endpoints
- **Purpose**: Controls file upload usage

### Health Check Limit
- **Limit**: 1000 requests per minute
- **Applies to**: Health check endpoint
- **Purpose**: Allows monitoring tools to check server status

## Response Headers

Rate limiting adds these headers to API responses:

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests left in current window
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Error Response

When limit is exceeded, you get:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Testing Rate Limits

### Normal Request
```bash
curl -X GET http://localhost:3000/api/health
```

### Exceed Limit (Example)
```bash
# Make 6 login attempts quickly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
done
```

## Configuration

Rate limits are configured in `src/middlewares/rateLimit.middleware.js`. You can adjust:

- Time windows (windowMs)
- Maximum requests (max)
- Error messages
- Which routes to protect

## Best Practices

- Use different limits for different types of endpoints
- Monitor rate limit usage
- Consider user-based limits for logged-in users
- Use Redis for distributed rate limiting in production