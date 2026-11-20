import { z } from "zod";
import { validationTranslation } from "./translation.validation.js";

const objectIdRegex = /^[a-f\d]{24}$/i;

const createMessage = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    title: z
      .string({ error: t.title.required[lang] })
      .trim()
      .min(1, t.title.min[lang]),

    content: z
      .string({ error: t.content.required[lang] })
      .trim()
      .min(1, t.content.min[lang]),

    // the sender can choose the receiver by his id OR by his username (from the share link)
    // both are optional here, but the .refine below makes sure exactly one of them is sent
    receiverId: z
      .string({ error: t.receiverId.invalid[lang] })
      .regex(objectIdRegex, t.receiverId.invalid[lang])
      .optional(),

    receiverUsername: z
      .string({ error: t.receiverUsername.invalid[lang] })
      .trim()
      .toLowerCase()
      .optional(),

    // optional: if not sent the message is anonymous by default
    // (guests are always anonymous, the service forces it)
    isAnonymous: z
      .boolean({ error: t.isAnonymous.invalid[lang] })
      .optional(),
  })
    // exactly one of receiverId / receiverUsername
    // (!!a !== !!b) is true only when one of them exists and the other doesn't
    .refine((body) => !!body.receiverId !== !!body.receiverUsername, {
      message: t.receiverId.required[lang],
      path: ["receiverId"],
    });
};

// NOTE: there are no update / replace schemas anymore
// because a message can't be edited after it's sent (decision B5)

const noteIdParams = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    noteId: z
      .string({ error: t.noteId.required[lang] })
      .regex(objectIdRegex, t.noteId.invalid[lang]),
  });
};

const idParams = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    id: z
      .string({ error: t.id.required[lang] })
      .regex(objectIdRegex, t.id.invalid[lang]),
  });
};

const paging = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
};

export const createMessageSchema = (lang) => {
  return z.object({
    body: createMessage(lang),
  });
};

export const deleteMessageSchema = (lang) => {
  return z.object({
    params: noteIdParams(lang),
  });
};

// POST / DELETE /api/messages/:noteId/block-sender -> same params as delete (just the message id)
export const blockSenderSchema = (lang) => {
  return z.object({
    params: noteIdParams(lang),
  });
};

export const paginateMessagesSchema = (lang) => {
  return z.object({
    query: z.object({
      ...paging,
      search: z.string().trim().optional(),
    }),
  });
};

export const getMessageSchema = (lang) => {
  return z.object({
    params: idParams(lang),
  });
};

export const getMessagesByContentSchema = (lang) => {
  const t = validationTranslation.message;

  return z.object({
    query: z.object({
      search: z
        .string({ error: t.search.required[lang] })
        .trim()
        .min(1, t.search.required[lang]),
      ...paging,
    }),
  });
};

export const getAllMessagesSchema = (lang) => {
  const t = validationTranslation.message;

  return z.object({
    query: z.object({
      type: z
        .enum(["0", "1", "2"], { error: t.type.invalid[lang] })
        .default("0"),
    }),
  });
};