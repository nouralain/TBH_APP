import { languagesEnum } from "../../../lib/enum/languages.enum.js";

export const validationTranslation = {
  message: {
    title: {
      required: {
       [languagesEnum.EN]: "Title is required",
       [languagesEnum.AR]: "العنوان مطلوب"
      },
      min: {
       [languagesEnum.EN]: "Title cannot be empty",
       [languagesEnum.AR]: "لا يمكن أن يكون العنوان فارغاً"
      }
    },
    content: {
      required: {
       [languagesEnum.EN]: "Content is required",
       [languagesEnum.AR]: "المحتوى مطلوب"
      },
      min: {
       [languagesEnum.EN]: "Content cannot be empty",
       [languagesEnum.AR]: "لا يمكن أن يكون المحتوى فارغاً"
      }
    },
    receiverId: {
      required: {
       [languagesEnum.EN]: "Send the receiver as receiverId or receiverUsername (only one of them)",
       [languagesEnum.AR]: "أرسل المستقبل باستخدام receiverId أو receiverUsername (واحد فقط)"
      },
      invalid: {
       [languagesEnum.EN]: "Invalid receiver ID",
       [languagesEnum.AR]: "معرف المستقبل غير صالح"
      }
    },
    receiverUsername: {
      invalid: {
       [languagesEnum.EN]: "Invalid receiver username",
       [languagesEnum.AR]: "اسم المستخدم للمستقبل غير صالح"
      }
    },
    isAnonymous: {
      invalid: {
       [languagesEnum.EN]: "isAnonymous must be true or false",
       [languagesEnum.AR]: "يجب أن تكون قيمة isAnonymous صح أو خطأ"
      }
    },
    noteId: {
      required: {
       [languagesEnum.EN]: "Note ID is required",
       [languagesEnum.AR]: "معرف الرسالة مطلوب"
      },
      invalid: {
       [languagesEnum.EN]: "Invalid note ID",
       [languagesEnum.AR]: "معرف الرسالة غير صالح"
      }
    },
    id: {
      required: {
       [languagesEnum.EN]: "ID is required",
       [languagesEnum.AR]: "المعرف مطلوب"
      },
      invalid: {
       [languagesEnum.EN]: "Invalid ID",
       [languagesEnum.AR]: "المعرف غير صالح"
      }
    },
    search: {
      required: {
       [languagesEnum.EN]: "Search text is required",
       [languagesEnum.AR]: "نص البحث مطلوب"
      }
    },
    type: {
      invalid: {
       [languagesEnum.EN]: "Type must be 0, 1, or 2",
       [languagesEnum.AR]: "النوع يجب أن يكون 0 أو 1 أو 2"
      }
    }
  }
};