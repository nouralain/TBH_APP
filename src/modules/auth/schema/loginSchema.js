import {z} from "zod";
import { generalValidationFields } from "../../../lib/utils/generalValidation.js";

export const loginSchema =(lang)=>{
  return z.object({
body:login(lang),
  });
}

const login = (lang) => z.strictObject({
  email: generalValidationFields.email(lang),
  password:generalValidationFields.password(lang) 
})