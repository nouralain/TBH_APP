export const trimString = (...strings)=>{
    const trimmed =  strings.map((string)=>string.trim())
    if(trimmed.some((s)=>!s))throw new Error("Please fill all fields",{cause:{status:400}})
        return trimmed
}