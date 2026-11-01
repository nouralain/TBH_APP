
import { MessageModel } from "../../../DB/model/message.model.js";
import { UserModel } from "../../../DB/model/user.model.js";
import { languagesEnum } from "../../../lib/enum/languages.enum.js";
import { NotFoundException } from "../../../pkg/errors/error.exception.js";
import { countDocuments, createOne, find, findOne, updateMany } from "../../../pkg/services/mongoose.services.js";
import { translations } from "../translations.message.js";

// const hideSender = (note, userId) => {
//     if (String(note.senderId) === String(userId)) return note
//     const { senderId, ...rest } = note
//     return rest
//   }
//1. take the title , content , id from req.validation.body
//2. make middleware to check if tokens in header then call auth middleware
//--> then send the senderid in the create
//3. search for the reciverid in db if exist
//4. create the message
export const createMessageService = async({title , content , reciverId} , senderId , lang)=>{
console.log({senderId ,reciverId});
const isExisted = await findOne({model:UserModel , filter:{_id:reciverId}})
console.log(isExisted);
if(!isExisted)throw  new NotFoundException(
    lang === languagesEnum.AR 
        ? translations.notFound.AR 
        : translations.notFound.EN
);

return await createOne({model:MessageModel , data:{
    title,
    content,
    reciverId,
    ...(senderId&& { senderId}),
}})
}

export const updateService = async({noteId, data, userId, lang})=>{
    const note = await findById({model:MessageModel, id:noteId, options:{lean:true}})
    if (!note) throw new NotFoundException(lang === languagesEnum.EN ? translations.notFound.EN : translations.notFound.AR, lang)
  
    if (String(note.senderId) !== String(userId)) {
      throw new ForbiddenException(lang === languagesEnum.EN ? translations.notOwner.EN : translations.notOwner.AR, lang)
    }
  
    return await findByIdAndUpdate({model:MessageModel, id:noteId, update:data, options:{returnDocument:"after", runValidators:true}})
  }
  
  export const replaceService = async({noteId, data, userId, lang})=>{
    const note = await findById({model:MessageModel, id:noteId, options:{lean:true}})
    if (!note) throw new NotFoundException(lang === languagesEnum.EN ? translations.notFound.EN : translations.notFound.AR, lang)
  
    if (String(note.senderId) !== String(userId)) {
      throw new ForbiddenException(lang === languagesEnum.EN ? translations.notOwner.EN : translations.notOwner.AR, lang)
    }
  
    return await findByIdAndUpdate({model:MessageModel, id:noteId, update:{title:data.title, content:data.content}, options:{returnDocument:"after", runValidators:true}})
  }
  
  export const updateAllTitlesService = async({title, userId})=>{
    const result = await updateMany({model:MessageModel, filter:{senderId:userId}, update:{title}})
    return {modifiedCount: result.modifiedCount}
  }
  
  export const deleteService = async({noteId, userId, lang})=>{
    const note = await findById({model:MessageModel, id:noteId, options:{lean:true}})
    if (!note) throw new NotFoundException(lang === languagesEnum.EN ? translations.notFound.EN : translations.notFound.AR, lang)
  
    if (String(note.reciverId) !== String(userId)) {
      throw new ForbiddenException(lang === languagesEnum.EN ? translations.notReceiver.EN : translations.notReceiver.AR, lang)
    }
  
    await deleteOne({model:MessageModel, filter:{_id:noteId}})
  }
  
  export const paginateService = async({page, limit, search}, userId)=>{
    const filter = {reciverId:userId}
    if (search) {
      filter.$or = [
        {title:{$regex:search, $options:"i"}},
        {content:{$regex:search, $options:"i"}},
      ]
    }
  
    const notes = await find({model:MessageModel, filter, options:{sort:{createdAt:-1}, skip:(page-1)*limit, limit, lean:true}})
    const total = await countDocuments({model:MessageModel, filter})
  
    return {
      notes: notes.map((note)=> hideSender(note, userId)),
      total,
      page,
      pages: Math.ceil(total/limit),
    }
  }
  
  export const getOneService = async({noteId, userId, lang})=>{
    const note = await findById({model:MessageModel, id:noteId, options:{lean:true}})
    if (!note) throw new NotFoundException(lang === languagesEnum.EN ? translations.notFound.EN : translations.notFound.AR, lang)
  
    if (String(note.senderId) !== String(userId) && String(note.reciverId) !== String(userId)) {
      throw new ForbiddenException(lang === languagesEnum.EN ? translations.notParticipant.EN : translations.notParticipant.AR, lang)
    }
  
    return hideSender(note, userId)
  }
  
  export const getByContentService = async({search, page, limit}, userId)=>{
    const filter = {reciverId:userId, content:{$regex:search, $options:"i"}}
  
    const notes = await find({model:MessageModel, filter, options:{sort:{createdAt:-1}, skip:(page-1)*limit, limit, lean:true}})
    const total = await countDocuments({model:MessageModel, filter})
  
    return {
      notes,
      total,
      page,
      pages: Math.ceil(total/limit),
    }
  }
  
  export const getAllService = async(type, userId)=>{
    const filters = {
      "0": {$or:[{senderId:userId}, {reciverId:userId}]},
      "1": {senderId:userId},
      "2": {reciverId:userId},
    }
  
    return await find({model:MessageModel, filter:filters[type], options:{sort:{createdAt:-1}, lean:true}})
  }