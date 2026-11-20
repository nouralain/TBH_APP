import mongoose, { Schema } from "mongoose";
import { genderEnum } from "../../lib/enum/gender.enum.js";
import { providerEnum } from "../../lib/enum/provider.enum.js";

const userScheme = new Schema({

    firstName:{
        type:String ,
        required:true,
        minLength:2,
        maxLength:25,
        lowercase: true,
        trim:true

},
    lastName:{
        type:String ,
        required:true,
        minLength:2,
        maxLength:25,
        lowercase: true,
        trim:true
},
    email:{
        type:String,
        required:true,
        unique:true
    },
    // public handle used in the share link: /u/nour_4821
    // - unique: two users can't have the same username
    // - sparse: old users created before this field have no username,
    //   sparse lets many documents have NO username without breaking "unique"
    // it's generated automatically on signup, the user can change it later (PATCH /api/users)
    username:{
        type:String,
        unique:true,
        sparse:true,
        lowercase:true,
        trim:true,
        minLength:3,
        maxLength:30,
        match:/^[a-z0-9_.]+$/,
    },
    password:{
        type:String,
        required:function(){
          return this.provider===providerEnum.SYSTEM?true:false
        },

    },
    phone:{
        type:String,
        required:false
    },
    age:{
        type:Number,
    },
    gender:{
        type:Number,
        enum:Object.values(genderEnum),
        default:genderEnum.MALE,
    },
    provider:{
        type:Number,
        enum:Object.values(providerEnum),
        default:providerEnum.SYSTEM,
    },
    // privacy setting: if false, only logged-in users who send WITH their name can message him
    // (guests are always anonymous, so they can't send to him at all)
    allowAnonymousMessages:{
        type:Boolean,
        default:true,
    },
    // users this person blocked. they can't send him any message (anonymous or named).
    // !! this list must NEVER be returned to the client:
    // he blocked some of them from anonymous messages, so their ids would reveal who sent them
    // -> that's why the toJSON / toObject transforms below remove it
    blockedUsers:[{
        type:mongoose.Types.ObjectId,
        ref:"User",
    }]
    

},{
timestamps:true,
autoIndex:true,
strict:true,
optimisticConcurrency:true,
toObject:{virtuals:true,
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.phone;
        delete ret.__v;
        // show only HOW MANY users he blocked, never WHO (see blockedUsers above)
        ret.blockedCount = ret.blockedUsers?.length ?? 0;
        delete ret.blockedUsers;
        return ret;
      },
},
toJSON:{virtuals:true,
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.phone;
        delete ret.__v;
        // show only HOW MANY users he blocked, never WHO (see blockedUsers above)
        ret.blockedCount = ret.blockedUsers?.length ?? 0;
        delete ret.blockedUsers;
        return ret;
      },
}
})

userScheme.virtual("userName").set(function(value){
    const [firstName,lastName] = value?.split(" ") ||[]
    this.set({firstName,lastName})
}).get(function(){
    return `${this.firstName} ${this.lastName}`
})

export const UserModel = mongoose.models.User || mongoose.model("User",userScheme)