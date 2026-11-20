import { createClient } from "redis"
import { REDIS_URL } from "../config.js";

export const client = createClient({
  url:REDIS_URL
});

// D4: without an "error" listener node-redis crashes the whole process when the connection drops.
// it reconnects by itself; while it's down client.isReady is false ->
// rate limits on auth routes answer 503, the others let requests through.
client.on("error", (error) => console.error("Redis error:", error.message))
client.on("ready", () => console.log("Redis connected successfully"))

// D4: fail startup -> the error is no longer swallowed, bootstrapDB catches it and exits
// (OTP, signup sessions and rate limits all live in Redis, the app isn't usable without it)
export const connectRedis = async()=>{
  await client.connect()
}
