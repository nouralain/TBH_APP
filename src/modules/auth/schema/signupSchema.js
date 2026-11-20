import {z} from "zod";
import { passwordsMatch, generalValidationFields } from "../../../lib/utils/generalValidation.js";
import { validationTranslation } from "./translate.validations.js";

export const signupSchema =(lang)=>{
  return z.object({
    body:signup(lang)
  })
}

export const signup = (lang)=> z.strictObject({
  userName: generalValidationFields.userName(lang),
  email:generalValidationFields.email(lang),
  password:generalValidationFields.password(lang),
  confirmPassword: generalValidationFields.password(lang),
  phone: generalValidationFields.phone(lang),
  age: generalValidationFields.age(lang),
  gender: generalValidationFields.gender(lang),
}).refine(passwordsMatch, {
  message: validationTranslation.confirmPassword.mismatch[lang],
  path: ["confirmPassword"],
});

export const googleSignupSchema = (lang) => z.object({
  body: z.strictObject({
    idToken: z.string({ error: validationTranslation.idToken.required[lang] }).min(1, validationTranslation.idToken.required[lang]),
  }),
});
