
import { MessageModel } from "../../../DB/model/message.model.js";
import { UserModel } from "../../../DB/model/user.model.js";
import { languagesEnum } from "../../../lib/enum/languages.enum.js";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../../pkg/errors/error.exception.js";
import { countDocuments, createOne, deleteOne, find, findById, findOne, updateOne } from "../../../pkg/services/mongoose.services.js";
import { translations } from "../translations.message.js";

/* ============================== helpers ============================== */

// only these user fields are allowed to appear inside a message
// (never email, phone, password ...)
const PUBLIC_USER_FIELDS = "firstName lastName username"

// populate = "replace the id with the actual user document"
// so instead of senderId: "65ab..." we get senderId: { _id, firstName, lastName, username }
const POPULATE_USERS = [
  { path: "senderId", select: PUBLIC_USER_FIELDS },
  { path: "receiverId", select: PUBLIC_USER_FIELDS },
]

// after populate, senderId can be an object ({_id, firstName...}) or still a plain id
// this helper always gives us back the id so we can compare it
const getId = (field) => field?._id ?? field

// turns a populated user into the small object we show in the response
// we use lean() so the "userName" virtual doesn't exist -> we build the name ourselves
const toPublicUser = (user) => {
  if (!user) return null
  return {
    id: user._id,
    userName: `${user.firstName} ${user.lastName}`,
    username: user.username,
  }
}

/**
 * THE MOST IMPORTANT FUNCTION FOR ANONYMITY
 * decides what the person who is asking (viewerId) is allowed to see.
 *
 * 1. if the viewer is the SENDER -> he can see everything (it's his own message)
 * 2. if the viewer is the RECEIVER:
 *      - anonymous message -> sender is null (we hide him completely, even his id)
 *      - named message     -> show the sender public info
 *
 * note: old messages (before we added isAnonymous) don't have the field,
 * so we treat "not false" as anonymous to be on the safe side.
 */
const formatMessage = (message, viewerId) => {
  const isSender = String(getId(message.senderId)) === String(viewerId)
  const isAnonymous = message.isAnonymous !== false

  let sender = null
  if (isSender || !isAnonymous) {
    sender = toPublicUser(message.senderId)
  }

  return {
    _id: message._id,
    title: message.title,
    content: message.content,
    isAnonymous,
    // tells the frontend if this message was sent BY me or TO me
    isSentByMe: isSender,
    sender,
    receiver: toPublicUser(message.receiverId),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  }
}

// small helper so we don't repeat the same 3 lines in every service
const notFoundError = (lang) =>
  new NotFoundException(lang === languagesEnum.EN ? translations.notFound.EN : translations.notFound.AR, lang)

/* ============================== create ============================== */

/**
 * 1. find the receiver by his id OR his username (the schema makes sure only one is sent)
 * 2. if not found -> 404
 * 3. you can't send a message to yourself
 * 4. if the receiver blocked this sender -> 403
 * 5. decide if the message is anonymous:
 *      - guest (no senderId)  -> ALWAYS anonymous, he has no name to show anyway
 *      - logged in            -> what he chose, and anonymous if he didn't choose
 * 6. if the receiver turned OFF anonymous messages and this one is anonymous -> 403
 * 7. create the message (we still save senderId for logged in users so they see it in
 *    their "sent" list and so the receiver can block them, formatMessage hides it from the receiver)
 */
export const createMessageService = async({title , content , receiverId , receiverUsername , isAnonymous} , senderId , lang)=>{
  //1
  const filter = receiverId ? { _id: receiverId } : { username: receiverUsername }
  const receiver = await findOne({model:UserModel , filter})

  //2
  if(!receiver) throw new NotFoundException(
    lang === languagesEnum.AR ? translations.receiverNotFound.AR : translations.receiverNotFound.EN,
    lang
  );

  //3
  if (senderId && String(receiver._id) === String(senderId)) {
    throw new BadRequestException(
      lang === languagesEnum.AR ? translations.cannotSendToSelf.AR : translations.cannotSendToSelf.EN,
      lang
    )
  }

  //4  blockedUsers is an array of ids -> we turn them to strings to compare
  //   (we don't tell him "you are blocked", just that he can't send, so it's not awkward)
  const blockedIds = (receiver.blockedUsers || []).map((id) => String(id))
  if (senderId && blockedIds.includes(String(senderId))) {
    throw new ForbiddenException(
      lang === languagesEnum.AR ? translations.cannotSendToUser.AR : translations.cannotSendToUser.EN,
      lang
    )
  }

  //5  "??" means: use the left value, but if it's undefined/null use the right one
  const finalIsAnonymous = senderId ? (isAnonymous ?? true) : true

  //6  allowAnonymousMessages === false (not just "falsy") so old users without the field still accept them
  if (finalIsAnonymous && receiver.allowAnonymousMessages === false) {
    throw new ForbiddenException(
      lang === languagesEnum.AR ? translations.anonymousNotAllowed.AR : translations.anonymousNotAllowed.EN,
      lang
    )
  }

  //7
  const message = await createOne({model:MessageModel , data:{
    title,
    content,
    receiverId: receiver._id,
    isAnonymous: finalIsAnonymous,
    ...(senderId && { senderId }),
  }})

  // we return a small object, the sender doesn't need the full document
  return {
    _id: message._id,
    title: message.title,
    content: message.content,
    isAnonymous: message.isAnonymous,
    receiver: { id: receiver._id, userName: receiver.userName, username: receiver.username },
    createdAt: message.createdAt,
  }
}

// NOTE: there is no update / replace / update-all-titles anymore.
// a message can't be edited after it's sent (decision B5) -> the receiver always reads
// exactly what was sent, the sender can't change it after it was read.

/* ============================== block sender (receiver only) ============================== */

/**
 * WHY BLOCK BY MESSAGE ID AND NOT BY USER ID?
 * on an anonymous message the receiver doesn't know who the sender is.
 * if we asked for the sender's user id, we'd have to show it first -> anonymity is gone.
 * so the receiver says "block whoever sent THIS message" and we do it on the server
 * without ever telling him who it was.
 *
 * 1. find the message
 * 2. only the receiver of the message can block its sender
 * 3. guest messages have no senderId -> there is nobody to block
 * 4. add the sender to the receiver's blockedUsers
 *    $addToSet = push only if not already in the array (no duplicates)
 *    $pull     = remove from the array (used in unblock)
 */
const getMessageSenderForReceiver = async(noteId, userId, lang)=>{
  //1
  const note = await findById({model:MessageModel, id:noteId, options:{lean:true}})
  if (!note) throw notFoundError(lang)

  //2
  if (String(note.receiverId) !== String(userId)) {
    throw new ForbiddenException(lang === languagesEnum.EN ? translations.notReceiver.EN : translations.notReceiver.AR, lang)
  }

  //3
  if (!note.senderId) {
    throw new BadRequestException(lang === languagesEnum.EN ? translations.guestCantBeBlocked.EN : translations.guestCantBeBlocked.AR, lang)
  }

  return note.senderId
}

export const blockSenderService = async(noteId, userId, lang)=>{
  const senderId = await getMessageSenderForReceiver(noteId, userId, lang)
  //4
  await updateOne({model:UserModel, filter:{_id:userId}, update:{$addToSet:{blockedUsers:senderId}}})
  // we don't return the senderId on purpose -> it would reveal who sent an anonymous message
}

export const unblockSenderService = async(noteId, userId, lang)=>{
  const senderId = await getMessageSenderForReceiver(noteId, userId, lang)
  await updateOne({model:UserModel, filter:{_id:userId}, update:{$pull:{blockedUsers:senderId}}})
}

/* ============================== delete (receiver only) ============================== */

export const deleteService = async(noteId, userId, lang)=>{
  const note = await findById({model:MessageModel, id:noteId, options:{lean:true}})
  if (!note) throw notFoundError(lang)

  if (String(note.receiverId) !== String(userId)) {
    throw new ForbiddenException(lang === languagesEnum.EN ? translations.notReceiver.EN : translations.notReceiver.AR, lang)
  }

  await deleteOne({model:MessageModel, filter:{_id:noteId}})
}

/* ============================== read ============================== */
// every read function below passes its results through formatMessage
// so the receiver can NEVER see the sender of an anonymous message

// inbox: messages I received, newest first, with optional search
export const paginateService = async({page, limit, search}, userId)=>{
  const filter = {receiverId:userId}
  if (search) {
    filter.$or = [
      {title:{$regex:search, $options:"i"}},
      {content:{$regex:search, $options:"i"}},
    ]
  }

  const notes = await find({model:MessageModel, filter, options:{sort:{createdAt:-1}, skip:(page-1)*limit, limit, lean:true, populate:POPULATE_USERS}})
  const total = await countDocuments({model:MessageModel, filter})

  return {
    notes: notes.map((note) => formatMessage(note, userId)),
    total,
    page,
    pages: Math.ceil(total/limit),
  }
}

/**
 * 1. find the message with sender/receiver populated
 * 2. only the sender or the receiver can see it
 * 3. format it depending on who is asking
 */
export const getOneService = async(noteId, userId, lang)=>{
  //1
  const note = await findById({model:MessageModel, id:noteId, options:{lean:true, populate:POPULATE_USERS}})
  if (!note) throw notFoundError(lang)

  //2  (we use getId because senderId/receiverId are objects now after populate)
  const isSender = String(getId(note.senderId)) === String(userId)
  const isReceiver = String(getId(note.receiverId)) === String(userId)
  if (!isSender && !isReceiver) {
    throw new ForbiddenException(lang === languagesEnum.EN ? translations.notParticipant.EN : translations.notParticipant.AR, lang)
  }

  //3
  return formatMessage(note, userId)
}

export const getByContentService = async({search, page, limit}, userId)=>{
  const filter = {receiverId:userId, content:{$regex:search, $options:"i"}}

  const notes = await find({model:MessageModel, filter, options:{sort:{createdAt:-1}, skip:(page-1)*limit, limit, lean:true, populate:POPULATE_USERS}})
  const total = await countDocuments({model:MessageModel, filter})
  return {
    notes: notes.map((note) => formatMessage(note, userId)),
    total,
    page,
    pages: Math.ceil(total/limit),
  }
}

// type: "0" = sent + received, "1" = sent only, "2" = received only
export const getAllService = async(type, userId)=>{
  const filters = {
    "0": {$or:[{senderId:userId}, {receiverId:userId}]},
    "1": {senderId:userId},
    "2": {receiverId:userId},
  }

  const notes = await find({model:MessageModel, filter:filters[type], options:{sort:{createdAt:-1}, lean:true, populate:POPULATE_USERS}})
  return notes.map((note) => formatMessage(note, userId))
}
