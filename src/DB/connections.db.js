import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { UserModel } from "./model/user.model.js";
import { MessageModel } from "./model/message.model.js";
import { connectRedis } from "../cache/redis.connection.js";

export default async function bootstrapDB() {
  try {
    await mongoose.connect(DB_URI)
    console.log('✅ Database connected');
    await connectRedis()
    await Promise.all([UserModel.syncIndexes(), MessageModel.syncIndexes()])
  } catch (err) {
    console.error('❌ Failed to connect to database', err);
    process.exit(1);
  }
}
