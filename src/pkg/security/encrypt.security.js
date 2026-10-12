import crypto from "node:crypto"
import { ENC_ALGORITHM, ENC_KEY, IV_LENGTH } from "../../config.js"
export const encrypt = async(plainText)=>{
    const iv = crypto.randomBytes(IV_LENGTH)
  const cypher =  crypto.createCipheriv(ENC_ALGORITHM,ENC_KEY ,iv )
  console.log(iv);
  
  let encryptedData = cypher.update(plainText , "utf-8" , "hex")
  encryptedData+=cypher.final("hex")

  return `${iv.toString("hex")}::${encryptedData}`

}

