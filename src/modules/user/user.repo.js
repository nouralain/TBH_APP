import prisma from "../../DB/connections.db.js"

export const update = async(id,data)=>{
    return await prisma.user.update({
        data,
        where:{id},
        select:{name:true,email:true,role:true}
    })
}

export const findUserByIdNoRole =async (id)=>{
return await prisma.user.findUnique({where:{id},omit:{role:false}})
}
