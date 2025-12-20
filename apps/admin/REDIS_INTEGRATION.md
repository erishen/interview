# Redis Integration for Interview Admin Project

This document describes the Redis integration added to the interview admin project.

## Overview

Redis has been successfully integrated into the admin project to provide:
- Session management and caching
- User data caching
- Authentication event logging
- Performance optimization

## Features Added

### 1. Redis Client Configuration
- **File**: `src/lib/redis.ts`
- **Features**:
  - Singleton Redis client using ioredis
  - Connection management with error handling
  - Session store for NextAuth integration
  - Cache utilities with TTL support

### 2. Authentication Integration
- **File**: `src/lib/auth.ts` (updated)
- **Features**:
  - User data caching (5 minutes TTL)
  - Session data storage in Redis
  - Login/logout event logging
  - Automatic session cleanup on signout

### 3. API Endpoints
- **Health Check**: `/api/redis/health`
  - Tests Redis connectivity
  - Validates basic operations
- **Cache Management**: `/api/redis/cache`
  - GET: Retrieve cached values
  - POST: Set cache values with TTL
  - DELETE: Remove cached values

### 4. Test Interface
- **File**: `src/app/redis-test/page.tsx`
- **Features**:
  - Real-time Redis health monitoring
  - Interactive cache operations
  - Session information display
  - User-friendly testing interface

## Configuration

### Environment Variables
Add to `.env.local`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Dependencies Added
- `redis`: ^4.6.12
- `ioredis`: ^5.3.2
- `@types/redis`: ^4.0.11
- `@types/ioredis`: ^5.0.0

## Usage

### Starting Redis Server
```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally and run
redis-server
```

### Testing the Integration
1. Start the admin application: `pnpm dev`
2. Navigate to `/redis-test` (requires authentication)
3. Check Redis health status
4. Test cache operations

### Cache Usage Examples

```typescript
import { redisCache } from '@/lib/redis'

// Set cache with 5 minute TTL
await redisCache.set('user:123', userData, 300)

// Get cached data
const userData = await redisCache.get('user:123')

// Delete cache
await redisCache.delete('user:123')
```

### Session Store Usage

```typescript
import { redisSessionStore } from '@/lib/redis'

// Store session data
await redisSessionStore.set('session-id', sessionData, 3600)

// Retrieve session data
const sessionData = await redisSessionStore.get('session-id')
```

## Benefits

1. **Performance**: User data caching reduces database queries
2. **Scalability**: Session data stored in Redis for horizontal scaling
3. **Monitoring**: Authentication events logged for security analysis
4. **Reliability**: Connection pooling and error handling
5. **Flexibility**: Easy to extend for additional caching needs

## Security Considerations

- Redis password authentication (configure REDIS_PASSWORD)
- Network security (use private networks in production)
- Data encryption in transit (configure TLS if needed)
- Regular backup of critical session data

## Monitoring

The health check endpoint provides:
- Connection status
- Basic operation testing
- Error reporting
- Timestamp tracking

## Next Steps

1. Install and start Redis server
2. Run `pnpm install` to install new dependencies
3. Configure environment variables
4. Test the integration using `/redis-test` page
5. Monitor performance improvements

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check Redis server is running and accessible
2. **Authentication Error**: Verify REDIS_PASSWORD if set
3. **Port Issues**: Ensure Redis port (6379) is not blocked
4. **Memory Issues**: Monitor Redis memory usage in production

### Debug Mode
Set `NODE_ENV=development` to enable detailed Redis logging.