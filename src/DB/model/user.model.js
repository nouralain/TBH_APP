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
    }
    

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
        return ret;
      },
},
toJSON:{virtuals:true,
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.phone;
        delete ret.__v;
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