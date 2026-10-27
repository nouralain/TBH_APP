import { languagesEnum } from "../../../lib/enum/languages.enum.js";

export const validationTranslation = {
    userName: {
        min: {
            [languagesEnum.AR]: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل",
           [languagesEnum.EN]: "Username must be at least 3 characters"
        },
        max: {
            [languagesEnum.AR]: "لا يمكن أن يتجاوز اسم المستخدم 30 حرفًا",
           [languagesEnum.EN]: "Username cannot exceed 30 characters"
        },
        regex: {
            [languagesEnum.AR]: "الرجاء إدخال الاسم الأول والأخير",
           [languagesEnum.EN]: "Please enter your first and last name"
        }
    },
    email: {
        invalid: {
            [languagesEnum.AR]: "بريد إلكتروني غير صالح",
           [languagesEnum.EN]: "Invalid email address"
        },
        required: {
            [languagesEnum.AR]: "البريد الإلكتروني مطلوب",
           [languagesEnum.EN]: "Email is required"
        }
    },
    password: {
        min: {
            [languagesEnum.AR]: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
           [languagesEnum.EN]: "Password must be at least 8 characters"
        },
        max: {
            [languagesEnum.AR]: "لا يمكن أن تتجاوز كلمة المرور 16 حرفًا",
           [languagesEnum.EN]: "Password cannot exceed 16 characters"
        }
    },
    phone: {
        regex: {
            [languagesEnum.AR]: "الرجاء إدخال رقم هاتف مصري صحيح",
           [languagesEnum.EN]: "Please enter a valid Egyptian phone number"
        }
    },
    age: {
        int: {
            [languagesEnum.AR]: "يجب أن يكون العمر عدداً صحيحاً",
           [languagesEnum.EN]: "Age must be an integer"
        },
        min: {
            [languagesEnum.AR]: "يجب أن يكون عمرك 13 عامًا على الأقل",
           [languagesEnum.EN]: "You must be at least 13 years old"
        },
        max: {
            [languagesEnum.AR]: "الرجاء إدخال عمر صحيح",
           [languagesEnum.EN]: "Please enter a valid age"
        }
    },
    gender: {
        invalid: {
            [languagesEnum.AR]: "يجب أن يكون الجنس ذكراً أو أنثى",
           [languagesEnum.EN]: "Gender must be either male or female"
        }
    },
    otp: {
        len: {
            [languagesEnum.AR]: "رمز التأكيد 6 ارقام فقط",
           [languagesEnum.EN]: "OTP must be 6 numbers"
        }
    }
};