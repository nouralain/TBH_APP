import { client } from "../../cache/redis.connection.js";

// Set a key with an optional TTL (in seconds)
export const set = async ({ key, value, ttl = undefined } = {}) => {
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }
  
  const options = {};
  if (ttl !== undefined) {
    options.EX = ttl;
  }

  return await client.set(key, value, options);
};

// Get a key and automatically parse JSON if applicable
export const get = async ({ key } = {}) => {
  const data = await client.get(key);
  try {
    return JSON.parse(data);
  } catch (err) {
    return data; // Return raw string if it's not JSON
  }
};

// Delete a key
export const remove = async ({ key } = {}) => {
  return await client.del(key);
};

// Check if a key exists
export const exists = async ({ key } = {}) => {
  const result = await client.exists(key);
  return result === 1;
};

// Set expiration time on an existing key (TTL in seconds)
export const expire = async ({ key, ttl } = {}) => {
  return await client.expire(key, ttl);
};

export const ttl = async ({ key } = {}) => {
  return await client.ttl(key);
};

export const incr = async ({ key } = {}) => {
  return await client.incr(key);
};