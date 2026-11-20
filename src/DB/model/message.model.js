import mongoose, { Schema } from "mongoose";

// C1: one place for the size limits, the Zod schema imports the same numbers
// so the API error and the DB rule can never disagree
export const MESSAGE_LIMITS = {
  TITLE_MAX: 100,
  CONTENT_MAX: 1000,
  SEARCH_MAX: 100,
  REPORT_REASON_MAX: 300,
}

const messageSchema = new Schema({

  title:{
    type:String,
    required:true,
    trim:true,
    maxLength:MESSAGE_LIMITS.TITLE_MAX,
  },
  content:{
    type:String,
    required:true,
    trim:true,
    maxLength:MESSAGE_LIMITS.CONTENT_MAX,
  },
  // senderId is saved whenever the sender is logged in (even if anonymous)
  // so the sender sees it in his "sent" list and the receiver can block him.
  // guests (no token) have no senderId at all.
  senderId:{type:mongoose.Types.ObjectId , ref:"User"},
  receiverId:{type:mongoose.Types.ObjectId , ref:"User" , required:true},

  // C6: guests have no account, so to let the receiver block them we keep
  // an HMAC of their IP (never the IP itself). select:false -> it's never returned by a query
  // unless we ask for it explicitly with "+senderIpHash".
  senderIpHash:{type:String , select:false},

  // true  -> the receiver will NOT see who sent it
  // false -> the receiver will see the sender name
  // default is true because anonymous is the main idea of the app
  isAnonymous:{
    type:Boolean,
    default:true,
  },

  // C5: the receiver can report a message (abuse, spam ...)
  // only the receiver reports, so one report per message is enough
  report:{
    reason:{type:String , trim:true , maxLength:MESSAGE_LIMITS.REPORT_REASON_MAX},
    reportedAt:{type:Date},
  },
},{
timestamps:true,
autoIndex:true,
strict:true,
optimisticConcurrency:true,
})

// C4: every list is "my received / my sent messages, newest first"
messageSchema.index({ receiverId: 1, createdAt: -1 })
messageSchema.index({ senderId: 1, createdAt: -1 })
// for an admin "reported messages" view later (sparse -> only reported ones are indexed)
messageSchema.index({ "report.reportedAt": -1 }, { sparse: true })

export const MessageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)
