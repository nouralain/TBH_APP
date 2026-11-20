import crypto from "node:crypto"
import { ENC_ALGORITHM, ENC_KEY, IV_LENGTH } from "../../config.js"

// stored format: "<iv hex>::<cipher hex>"
export const encrypt = async(plainText)=>{
  const iv = crypto.randomBytes(IV_LENGTH)
  const cypher = crypto.createCipheriv(ENC_ALGORITHM, ENC_KEY, iv)
  let encryptedData = cypher.update(plainText, "utf-8", "hex")
  encryptedData += cypher.final("hex")

  return `${iv.toString("hex")}::${encryptedData}`
}

// E6: the reverse of encrypt. returns undefined (never throws) for an empty value
// or one that can't be decrypted (old format / key changed) -> the profile still loads.
export const decrypt = async(encryptedText)=>{
  if (!encryptedText) return undefined
  const [ivHex, data] = String(encryptedText).split("::")
  if (!ivHex || !data) return undefined
  try {
    const decipher = crypto.createDecipheriv(ENC_ALGORITHM, ENC_KEY, Buffer.from(ivHex, "hex"))
    let plainText = decipher.update(data, "hex", "utf-8")
    plainText += decipher.final("utf-8")
    return plainText
  } catch {
    return undefined
  }
}
