import prisma from "../../DB/connections.db.js"

export const findUserByEmail =async (email)=>{
return await prisma.user.findUnique({where:{email}})
}

export const findUserById =async (id)=>{
return await prisma.user.findUnique({where:{id}})
}
