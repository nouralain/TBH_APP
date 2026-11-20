export const translations ={
        notFound: {
            AR: "الرسالة غير موجودة",
          EN: "Message not found",
        },

          receiverNotFound: {
            AR: "المستلم غير موجود",
            EN: "Receiver not found",
          },
          tooManyToReceiver: {
            AR: "لقد أرسلت رسائل كثيرة لهذا المستخدم، يرجى المحاولة لاحقاً",
            EN: "You've sent too many messages to this user, please try again later",
          },
          cannotSendToSelf: {
            AR: "لا يمكنك إرسال رسالة لنفسك",
            EN: "You cannot send a message to yourself",
          },
          // used for delete + block + unblock -> all of them are "receiver only" actions
          notReceiver: {
            AR: "هذا الإجراء متاح لمستلم الرسالة فقط",
            EN: "Only the receiver of this message can do this",
          },
          notParticipant: {
            AR: "لا تملك صلاحية عرض هذه الرسالة",
            EN: "You are not allowed to view this message",
          },
          // the sender is blocked by the receiver
          // (we say it softly on purpose, we don't tell him "you are blocked")
          cannotSendToUser: {
            AR: "لا يمكنك إرسال رسائل لهذا المستخدم",
            EN: "You can't send messages to this user",
          },
          anonymousNotAllowed: {
            AR: "هذا المستخدم لا يستقبل رسائل مجهولة، سجّل الدخول وأرسل باسمك",
            EN: "This user doesn't accept anonymous messages. Log in and send with your name",
          },
          guestCantBeBlocked: {
            AR: "تم إرسال هذه الرسالة من زائر بدون حساب، لا يمكن حظره",
            EN: "This message was sent by a guest without an account, so they can't be blocked",
          },
          senderBlocked: {
            AR: "تم حظر المرسل",
            EN: "Sender blocked",
          },
          senderUnblocked: {
            AR: "تم إلغاء حظر المرسل",
            EN: "Sender unblocked",
          },
          // C5 moderation (anonymous messages only)
          linksNotAllowed: {
            AR: "لا يُسمح بالروابط في الرسائل المجهولة",
            EN: "Links aren't allowed in anonymous messages",
          },
          inappropriateContent: {
            AR: "الرسالة تحتوي على كلمات غير لائقة",
            EN: "Your message contains inappropriate words",
          },
          messageReported: {
            AR: "تم الإبلاغ عن الرسالة",
            EN: "Message reported",
          },
}
