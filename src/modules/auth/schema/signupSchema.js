import {z} from "zod";
import { confermFields, generalValidationFields } from "../../../lib/utils/generalValidation.js";

export const signupSchema =(lang)=>{
 return z.strictObject({
    userName: generalValidationFields.userName(lang),
    email:generalValidationFields.email(lang),
    password:generalValidationFields.password(lang),
    confirmPassword: generalValidationFields.password(lang),

    phone: generalValidationFields.phone(lang),
    age: generalValidationFields.age(lang),

    gender: generalValidationFields.gender(lang),

})

  .refine((data) => confermFields({data,message:"Passwords do not match" , path:"confirmPassword"}));

}
