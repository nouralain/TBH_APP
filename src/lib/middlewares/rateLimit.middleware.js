import { consume, isRedisReady, rateLimitKey } from "../utils/rateLimiter.js"
import { hashIp } from "../utils/ipHash.js"
import { getLang } from "../utils/getLanguage.js"
import { ServiceUnavailableException, TooManyRequestsException } from "../../pkg/errors/error.exception.js"

// we never put the raw IP in Redis, only its HMAC (same one used for blocking guests)
export const byIp = (req) => `ip:${hashIp(req.ip)}`

// D1 default: logged in -> by user id (so changing network doesn't reset it), guest -> by IP
// (rateLimit must come AFTER authentication / optionalAuthentication for req.user to exist)
export const byUserOrIp = (req) => (req.user ? `user:${req.user.id}` : byIp(req))

/**
 * D1: generic Redis rate limit.
 * @param keyPrefix   name of the limit, keeps counters of different routes apart
 * @param windowSec   window length in seconds
 * @param max         allowed hits per window (number, or (req) => number)
 * @param keyBy       (req) => string, who is being counted
 * @param failClosed  what to do when Redis is down (D4):
 *                    true  -> 503 (auth routes: without Redis there is no brute-force protection)
 *                    false -> let the request through (better than taking the whole app down)
 */
export const rateLimit = ({ keyPrefix, windowSec, max, keyBy = byUserOrIp, failClosed = false }) => {
  return async (req, res, next) => {
    const lang = getLang(req)
    const limit = typeof max === "function" ? max(req) : max

    let result
    try {
      result = await consume({ key: rateLimitKey(keyPrefix, keyBy(req)), windowSec, max: limit })
    } catch (error) {
      console.error(`rate limit "${keyPrefix}" skipped, Redis unavailable:`, error.message)
      return failClosed ? next(new ServiceUnavailableException(null, lang)) : next()
    }

    res.set("RateLimit-Limit", String(limit))
    res.set("RateLimit-Remaining", String(result.remaining))
    res.set("RateLimit-Reset", String(result.retryAfter))

    if (!result.allowed) return next(new TooManyRequestsException(null, lang, result.retryAfter))
    next()
  }
}

// D4: routes whose services keep their state in Redis (OTP, signup session, login lock)
// answer 503 right away instead of hanging / crashing with a 500 when Redis is down
export const requireRedis = () => (req, res, next) =>
  isRedisReady() ? next() : next(new ServiceUnavailableException(null, getLang(req)))
