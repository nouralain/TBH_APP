import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({

  title:{
    type:String,
    required:true,
  },
  content:{
    type:String,
    required:true,
  },
  // senderId is saved whenever the sender is logged in (even if anonymous)
  // so the sender sees it in his "sent" list and the receiver can block him.
  // guests (no token) have no senderId at all.
  senderId:{type:mongoose.Types.ObjectId , ref:"User"},
  receiverId:{type:mongoose.Types.ObjectId , ref:"User" , required:true},

  // true  -> the receiver will NOT see who sent it
  // false -> the receiver will see the sender name
  // default is true because anonymous is the main idea of the app
  isAnonymous:{
    type:Boolean,
    default:true,
  }
},{
timestamps:true,
autoIndex:true,
strict:true,
optimisticConcurrency:true,
})


export const MessageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)