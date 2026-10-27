import {z} from "zod";
import { generalValidationFields } from "../../../lib/utils/generalValidation.js";

export const confirmOtpSchema =(lang)=>{
    return z.strictObject({
      email: generalValidationFields.email(lang),
      otp:generalValidationFields.otp(lang)
    });
  }
export const resendOtpSchema =(lang)=>{
    return z.strictObject({
      email: generalValidationFields.email(lang),
    });
  }