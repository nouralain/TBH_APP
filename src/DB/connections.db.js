import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { UserModel } from "./model/user.model.js";
import { MessageModel } from "./model/message.model.js";
import { connectRedis } from "../cache/redis.connection.js";
import { logger } from "../lib/utils/logger.js";

export default async function bootstrapDB() {
  try {
    await mongoose.connect(DB_URI)
    logger.info('Database connected');
    await connectRedis()
    await Promise.all([UserModel.syncIndexes(), MessageModel.syncIndexes()])
  } catch (err) {
    // only the message: a connection error can contain the full URI with the DB password
    logger.error('Failed to connect to database / Redis:', err.message);
    process.exit(1);
  }
}
