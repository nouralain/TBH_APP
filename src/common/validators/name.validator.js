 const checkNameLength=(name)=>{
      if (!name) throw new Error("Name is a required field",{cause:{status:400}});
    const trimmedName = name.trim()
    if(!trimmedName)throw new Error("Name is a required field",{cause:{status:400}})
    if(trimmedName.length <2)throw new Error("Name must be more than 2 characters",{cause:{status:400}})
    return trimmedName
}
export default checkNameLength