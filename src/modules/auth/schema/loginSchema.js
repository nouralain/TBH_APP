import {z} from "zod";
import {  generalValidationFields } from "../../../lib/generalValidation.js";

export const loginSchema = z.strictObject({
    email: generalValidationFields.email,
    password:generalValidationFields.password 
  });