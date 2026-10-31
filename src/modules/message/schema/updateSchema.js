import {z} from "zod";
import { generalValidationFields } from "../../../lib/utils/generalValidation.js";

export const updateSchema = (lang) => {
  return z
    .object({
      userName: generalValidationFields.userName(lang),
      phone: generalValidationFields.phone(lang),
      age: generalValidationFields.age(lang),
      gender: generalValidationFields.gender(lang),
    })
    .partial()
    .transform((data) => {
      if (data.userName) {
        const [firstName, ...rest] = data.userName.split(" ");
        data.firstName = firstName;
        data.lastName = rest.join(" ");
      }
      return data;
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    });
};