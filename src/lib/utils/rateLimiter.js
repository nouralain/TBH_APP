import { client } from "../../cache/redis.connection.js"

// D1: fixed-window counter.
// INCR + EXPIRE run inside one Lua script, so they are atomic: if the app crashed between
// the two calls the key would otherwise live forever and block that user/IP for good.
// the second EXPIRE is a safety net for a key that somehow has no TTL (ttl = -1).
const FIXED_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`

export const rateLimitKey = (...parts) => `RateLimit::${parts.join("::")}`

// node-redis queues commands while it is disconnected (they would just hang),
// so we check this first and treat "not ready" like "Redis is down" (D4)
export const isRedisReady = () => client.isReady

/**
 * Counts one hit on `key` and tells whether it is still under `max` for this window.
 * Throws when Redis is not available -> the caller decides to fail open or closed.
 * @returns {{ count, remaining, retryAfter, allowed }}  retryAfter = seconds until the window resets
 */
export const consume = async ({ key, windowSec, max }) => {
  if (!isRedisReady()) throw new Error("Redis is not connected")

  const [count, ttl] = await client.eval(FIXED_WINDOW_SCRIPT, {
    keys: [key],
    arguments: [String(windowSec)],
  })

  return {
    count,
    remaining: Math.max(0, max - count),
    retryAfter: ttl,
    allowed: count <= max,
  }
}
