import {z} from "zod"
import { genderEnum } from "./enum/gender.enum.js"

export const confermFields = ({data , message , path}={})=>{
    return data.password === data.confirmPassword, {
        message,
        path: [...path], 
      }
}

export const generalValidationFields = {
    userName:  z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^\S+\s+\S+$/, "Please enter your first and last name"),
    email: z
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters"),

  phone: z
    .string()
    .regex(/^01[0125]\d{8}$/, "Please enter a valid Egyptian phone number"),

  age: z
    .number({ coerce: true })
    .int("Age must be an integer")
    .min(13, "You must be at least 13 years old")
    .max(120, "Please enter a valid age"),

  gender: z
  .enum(["MALE", "FEMALE", "male", "female"], {
    errorMap: () => ({ message: "Gender must be either male or female" }),
  })
  .transform((val) => genderEnum[val.toUpperCase()])

}