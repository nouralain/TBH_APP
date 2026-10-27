import { languagesEnum } from "../../lib/enum/languages.enum.js";

export const errorTranslation = {
    internalServer: {
        [languagesEnum.AR]: "خطأ في الخادم الداخلي",
      [languagesEnum.EN]: "Internal Server Error"
    },
    badRequest: {
        [languagesEnum.AR]: "طلب غير صالح",
      [languagesEnum.EN]: "Bad Request"
    },
    unauthorized: {
        [languagesEnum.AR]: "غير مصرح بالوصول",
      [languagesEnum.EN]: "Unauthorized access"
    },
    forbidden: {
        [languagesEnum.AR]: "إجراء محظور",
      [languagesEnum.EN]: "Forbidden action"
    },
    notFound: {
        [languagesEnum.AR]: "المورد غير موجود",
      [languagesEnum.EN]: "Resource not found"
    },
    conflict: {
        [languagesEnum.AR]: "حدث تعارض",
      [languagesEnum.EN]: "Conflict occurred"
    },
    unprocessableEntity: {
        [languagesEnum.AR]: "فشل التحقق من الصحة",
      [languagesEnum.EN]: "Validation failed"
    },
    wrongCredentials: {
        [languagesEnum.AR]: "بيانات غير صحيحة",
      [languagesEnum.EN]: "Wrong credentials"
    }
};