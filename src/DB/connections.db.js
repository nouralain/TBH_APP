import mongoose from "mongoose";
import { DB_URI, PORT } from "../config.js";
import { UserModel } from "./model/user.model.js";
import { connectRedis } from "../cache/redis.connection.js";


export default async function bootstrapDB(app) {
  try {
    await mongoose.connect(DB_URI)
    console.log('✅ Database connected');
   await connectRedis()
UserModel.syncIndexes()
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database', err);
    process.exit(1);
  }
}

