import {z} from "zod";
import { generalValidationFields } from "../../../lib/utils/generalValidation.js";

const updateBody = (lang) =>
  z
    .strictObject({
      userName: generalValidationFields.userName(lang),
      phone: generalValidationFields.phone(lang),
      age: generalValidationFields.age(lang),
      gender: generalValidationFields.gender(lang),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    })
    // userName is a virtual; findByIdAndUpdate needs the real fields.
    .transform(({ userName, ...rest }) => {
      if (!userName) return rest;
      const [firstName, ...lastName] = userName.split(/\s+/);
      return { ...rest, firstName, lastName: lastName.join(" ") };
    });

export const updateSchema = (lang) => z.object({ body: updateBody(lang) });
