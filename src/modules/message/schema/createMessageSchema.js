import { z } from "zod";
import { validationTranslation } from "./translation.validation.js";

const objectIdRegex = /^[a-f\d]{24}$/i;

const createMessage = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    title: z
      .string({ required_error: t.title.required[lang] })
      .trim()
      .min(1, t.title.min[lang]),

    content: z
      .string({ required_error: t.content.required[lang] })
      .trim()
      .min(1, t.content.min[lang]),

    reciverId: z
      .string({ required_error: t.reciverId.required[lang] })
      .regex(objectIdRegex, t.reciverId.invalid[lang]),
  });
};

const updateMessage = (lang) => {
  const t = validationTranslation.message;

  return z
    .strictObject({
      title: z
        .string({ required_error: t.title.required[lang] })
        .trim()
        .min(1, t.title.min[lang])
        .optional(),

      content: z
        .string({ required_error: t.content.required[lang] })
        .trim()
        .min(1, t.content.min[lang])
        .optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: t.updateEmpty[lang],
    });
};

const replaceMessage = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    title: z
      .string({ required_error: t.title.required[lang] })
      .trim()
      .min(1, t.title.min[lang]),

    content: z
      .string({ required_error: t.content.required[lang] })
      .trim()
      .min(1, t.content.min[lang]),
  });
};

const updateAllTitles = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    title: z
      .string({ required_error: t.title.required[lang] })
      .trim()
      .min(1, t.title.min[lang]),
  });
};

const noteIdParams = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    noteId: z
      .string({ required_error: t.noteId.required[lang] })
      .regex(objectIdRegex, t.noteId.invalid[lang]),
  });
};

const idParams = (lang) => {
  const t = validationTranslation.message;

  return z.strictObject({
    id: z
      .string({ required_error: t.id.required[lang] })
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

export const updateMessageSchema = (lang) => {
  return z.object({
    params: noteIdParams(lang),
    body: updateMessage(lang),
  });
};

export const replaceMessageSchema = (lang) => {
  return z.object({
    params: noteIdParams(lang),
    body: replaceMessage(lang),
  });
};

export const updateAllTitlesSchema = (lang) => {
  return z.object({
    body: updateAllTitles(lang),
  });
};

export const deleteMessageSchema = (lang) => {
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
        .string({ required_error: t.search.required[lang] })
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
        .enum(["0", "1", "2"], { errorMap: () => ({ message: t.type.invalid[lang] }) })
        .default("0"),
    }),
  });
};