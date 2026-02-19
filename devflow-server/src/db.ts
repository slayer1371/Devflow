import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const globalForRedis = global as unknown as { redis: ReturnType<typeof createClient> };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const redis =
  globalForRedis.redis ||
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis only if not already connected
if (!redis.isOpen) {
  (async () => {
    await redis.connect();
    console.log('✅ Connected to Redis');
  })();
}
