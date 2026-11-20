import { languagesEnum } from "../enum/languages.enum.js"

// E7: one helper to pick a translation instead of repeating
// `lang === languagesEnum.AR ? x.AR : x.EN` everywhere.
// works with both dictionary styles used in the project:
//   { KEY: { EN: "...", AR: "..." } }   (module translations)
//   { key: { en: "...", ar: "..." } }   (languagesEnum keys)
// unknown language -> English, unknown key -> the key itself (easy to spot, never crashes)
export const t = (dictionary, key, lang = languagesEnum.EN) => {
  const entry = dictionary?.[key]
  if (!entry) return key
  const code = String(lang).toLowerCase()
  return entry[code.toUpperCase()] ?? entry[code] ?? entry.EN ?? entry[languagesEnum.EN] ?? key
}

// messages shared by every module (success responses, generic errors ...)
export const commonTranslations = {
  DONE: { EN: "Done", AR: "تم بنجاح" },
  MESSAGE_SENT: { EN: "Message sent", AR: "تم إرسال الرسالة" },
  MESSAGE_DELETED: { EN: "Message deleted", AR: "تم حذف الرسالة" },
  ROUTE_NOT_FOUND: { EN: "Invalid application routing", AR: "المسار غير موجود" },
  PROFILE_NOT_FOUND: { EN: "Profile not found", AR: "الحساب غير موجود" },
  INVALID_TOKEN: { EN: "Invalid token", AR: "رمز الدخول غير صالح" },
  TOKEN_REVOKED: { EN: "This session has ended, please log in again", AR: "انتهت هذه الجلسة، يرجى تسجيل الدخول مرة أخرى" },
  INVALID_GOOGLE_TOKEN: { EN: "Invalid Google token", AR: "رمز جوجل غير صالح" },
  GOOGLE_EMAIL_NOT_VERIFIED: { EN: "Google email is not verified", AR: "البريد الإلكتروني في جوجل غير مؤكد" },
  INVALID_ID: { EN: "Invalid id", AR: "المعرف غير صالح" },
  INVALID_VALUE: { EN: "Invalid value", AR: "قيمة غير صالحة" },
  DUPLICATE_VALUE: { EN: "This value is already in use", AR: "هذه القيمة مستخدمة بالفعل" },
  DOCUMENT_CHANGED: { EN: "The data was changed by another request, please try again", AR: "تم تعديل البيانات بواسطة طلب آخر، يرجى المحاولة مرة أخرى" },
  CORS_NOT_ALLOWED: { EN: "Origin not allowed", AR: "هذا المصدر غير مسموح به" },
}

export const tc = (key, lang) => t(commonTranslations, key, lang)
