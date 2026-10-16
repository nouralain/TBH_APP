import {z} from "zod";
import { confermFields, generalValidationFields } from "../../../lib/generalValidation.js";

export const signupSchema =z.strictObject({
    userName: generalValidationFields.userName,
    confirmPassword: generalValidationFields.password,

    phone: generalValidationFields.phone,
    age: generalValidationFields.age,

    gender: generalValidationFields.gender,

})

  .refine((data) => confermFields({data,message:"Passwords do not match" , path:"confirmPassword"}));

