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
  senderId:{type:mongoose.Types.ObjectId , ref:User},
  reciverId:{type:mongoose.Types.ObjectId , ref:User , required:true}
},{
timestamps:true,
autoIndex:true,
strict:true,
optimisticConcurrency:true,
})


export const MessageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)