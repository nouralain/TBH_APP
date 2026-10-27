import { createClient } from "redis"
import { REDIS_URL } from "../config.js";

export const client = createClient({
  url:REDIS_URL
});

export const connectRedis = async()=>{
    try {
        await client.connect()
console.log("Redis connected successfully");

    } catch (error) {
        console.log("Couldnt connect to redis",error);
        
    }
}