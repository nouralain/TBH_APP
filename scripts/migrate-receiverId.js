/**
 * ONE-TIME MIGRATION (ticket B6)
 * we renamed the message field "reciverId" (typo) to "receiverId".
 * the code now only knows "receiverId", so old messages in the database must be renamed too,
 * otherwise they disappear from the inbox.
 *
 * run it once:   npm run migrate:receiverId
 * running it again is safe: the filter only matches messages that still have the old field.
 */
import "../src/config.js"
import mongoose from "mongoose"
import { DB_URI } from "../src/config.js"

await mongoose.connect(DB_URI)
console.log("✅ connected")

// we use the raw collection (not MessageModel) because the model doesn't have "reciverId" anymore
// and mongoose "strict" mode would ignore it.
// $rename = MongoDB operator that renames a field and keeps its value
const result = await mongoose.connection.collection("messages").updateMany(
  { reciverId: { $exists: true } },
  { $rename: { reciverId: "receiverId" } }
)

console.log(`renamed reciverId -> receiverId in ${result.modifiedCount} message(s)`)
await mongoose.disconnect()
