import * as memjs from 'memjs';
import * as logger from 'firebase-functions/logger';

// Memcached Configuration (Supports Memcachier/Cloud Elements)
const SERVERS = process.env.MEMCACHIER_SERVERS || 'localhost:11211';
const USERNAME = process.env.MEMCACHIER_USERNAME;
const PASSWORD = process.env.MEMCACHIER_PASSWORD;

// Local Memory Fallback for dev or if Memcached is unavailable
const localCache = new Map<string, { value: any; expiry: number }>();

let client: memjs.Client | null = null;

try {
    if (USERNAME && PASSWORD) {
        client = memjs.Client.create(SERVERS, {
            username: USERNAME,
            password: PASSWORD
        });
        logger.info("Memcached: Initialized with authentication.");
    } else if (process.env.NODE_ENV === 'production' || process.env.MEMCACHIER_SERVERS) {
        client = memjs.Client.create(SERVERS);
        logger.info("Memcached: Initialized (No Auth).");
    } else {
        logger.info("Memcached: No servers configured, using local memory fallback.");
    }
} catch (err) {
    logger.error("Memcached initialization failed. Using memory fallback.", err);
    client = null;
}

export const cache = {
    /**
     * Get a value from cache
     * @param key Unique key
     */
    async get<T>(key: string): Promise<T | null> {
        if (client) {
            try {
                const { value } = await client.get(key);
                if (value) {
                    return JSON.parse(value.toString()) as T;
                }
            } catch (err) {
                logger.warn(`Memcached GET error for key ${key}:`, err);
            }
        }

        // Fallback to Local Memory
        const hit = localCache.get(key);
        if (hit && hit.expiry > Date.now()) {
            return hit.value as T;
        } else if (hit) {
            localCache.delete(key);
        }

        return null;
    },

    /**
     * Set a value in cache
     * @param key Unique key
     * @param value Value to store
     * @param ttl Time to live in seconds (default 1 hour)
     */
    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        const stringValue = JSON.stringify(value);

        if (client) {
            try {
                await client.set(key, stringValue, { expires: ttl });
            } catch (err) {
                logger.warn(`Memcached SET error for key ${key}:`, err);
            }
        }

        // Store in Local Memory Fallback
        localCache.set(key, {
            value,
            expiry: Date.now() + (ttl * 1000)
        });
    },

    /**
     * Delete a value from cache
     */
    async delete(key: string): Promise<void> {
        if (client) {
            try {
                await client.delete(key);
            } catch (err) {
                logger.warn(`Memcached DELETE error for key ${key}:`, err);
            }
        }
        localCache.delete(key);
    }
};
