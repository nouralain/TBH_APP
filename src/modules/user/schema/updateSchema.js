import {z} from "zod";
import { generalValidationFields } from "../../../lib/utils/generalValidation.js";
import { t } from "../../../lib/utils/translate.js";
import { translations } from "../translations.user.js";

// POST /api/users/logout -> { allDevices?: boolean }
export const logoutSchema = (lang) =>
  z.object({
    body: z.strictObject({
      allDevices: z.boolean({ error: t(translations, "ALL_DEVICES_INVALID", lang) }).optional(),
    }),
  });

const updateBody = (lang) =>
  z
    .strictObject({
      userName: generalValidationFields.userName(lang),
      // the user can change his share-link handle (ex: nour_4821 -> nour.ahmed)
      // the service checks that nobody else already has it
      username: generalValidationFields.username(lang),
      phone: generalValidationFields.phone(lang),
      age: generalValidationFields.age(lang),
      gender: generalValidationFields.gender(lang),
      // privacy setting: false = "I don't want anonymous messages"
      allowAnonymousMessages: z.boolean(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: t(translations, "AT_LEAST_ONE_FIELD", lang),
    })
    // userName is a virtual; findByIdAndUpdate needs the real fields.
    .transform(({ userName, ...rest }) => {
      if (!userName) return rest;
      const [firstName, ...lastName] = userName.split(/\s+/);
      return { ...rest, firstName, lastName: lastName.join(" ") };
    });

export const updateSchema = (lang) => z.object({ body: updateBody(lang) });

// GET /api/users/public/:username
export const publicProfileSchema = (lang) =>
  z.object({
    params: z.strictObject({
      username: generalValidationFields.username(lang),
    }),
  });
