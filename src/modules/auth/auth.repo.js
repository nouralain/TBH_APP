
import prisma from './../../DB/connections.db.js';

export const create = async(name,email,password)=>{
return await prisma.user.create({
    data:{name,email,password},
      select: { id: true, name: true, email: true }
})
}

