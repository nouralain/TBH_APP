import {z} from "zod";
import { generalValidationFields } from "../../../lib/utils/generalValidation.js";

export const loginSchema =(lang)=>{
  return z.strictObject({
    email: generalValidationFields.email(lang),
    password:generalValidationFields.password(lang) 
  });
}