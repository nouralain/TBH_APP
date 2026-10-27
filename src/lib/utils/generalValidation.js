import { z } from "zod";
import { genderEnum } from "../enum/gender.enum.js";
import { validationTranslation } from "../../modules/auth/schema/translate.validations.js";

export const confermFields = ({ data, message, path } = {}) => {
    return data.password === data.confirmPassword, {
        message,
        path: [...path], 
      }
}

export const generalValidationFields = {
    userName: (lang) => {
        const t = validationTranslation.userName;
        return z
            .string()
            .trim()
            .min(3, t.min[lang])
            .max(30, t.max[lang])
            .regex(/^\S+\s+\S+$/, t.regex[lang]);
    },

    email: (lang) => {
        const t = validationTranslation.email;
        return z
            .string()
            .email(t.invalid[lang])
            .min(1, t.required[lang]);
    },

    password: (lang) => {
        const t = validationTranslation.password;
        return z
            .string()
            .min(8, t.min[lang])
            .max(16, t.max[lang]);
    },

    phone: (lang) => {
        const t = validationTranslation.phone;
        return z
            .string()
            .regex(/^01[0125]\d{8}$/, t.regex[lang]);
    },

    age: (lang) => {
        const t = validationTranslation.age;
        return z
            .number({ coerce: true })
            .int(t.int[lang])
            .min(13, t.min[lang])
            .max(120, t.max[lang]);
    },

    gender: (lang) => {
        const t = validationTranslation.gender;
        return z
            .enum(["MALE", "FEMALE", "male", "female"], {
                errorMap: () => ({ message: t.invalid[lang] }),
            })
            .transform((val) => genderEnum[val.toUpperCase()]);
    },
    otp: (lang) => {
        const t = validationTranslation.otp;
        return z
            .string()
            .length(6,t.len[lang])
    },
}