import { createHmac } from "node:crypto"
import { IP_HASH_SECRET } from "../../config.js"

// C6: HMAC (not a plain hash) because there are only ~4 billion IPv4 addresses,
// a plain sha256 could be reversed by trying them all. without the secret it can't.
export const hashIp = (ip) => {
  if (!ip) return undefined
  return createHmac("sha256", IP_HASH_SECRET).update(String(ip)).digest("hex")
}
