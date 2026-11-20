import Crypto from "node:crypto"
import { UserModel } from "../../DB/model/user.model.js"
import { findOne } from "../../pkg/services/mongoose.services.js"

/**
 * makes a unique username from the first name, ex: "Nour" -> "nour_4821"
 *
 * 1. clean the name: lowercase and remove anything that isn't a-z or 0-9
 *    (arabic names become empty -> we use "user" instead)
 * 2. add 4 random digits
 * 3. check the db, if it's taken try again (max 5 times)
 * 4. if we were very unlucky 5 times, use a longer random number
 */
export const generateUsername = async (firstName = "") => {
  //1
  let base = firstName.toLowerCase().replace(/[^a-z0-9]/g, "")
  if (base.length < 2) base = "user"
  base = base.slice(0, 20)

  for (let i = 0; i < 5; i++) {
    //2
    const username = `${base}_${Crypto.randomInt(1000, 10000)}`

    //3
    const isTaken = await findOne({ model: UserModel, filter: { username } })
    if (!isTaken) return username
  }

  //4
  return `${base}_${Crypto.randomInt(100000, 1000000)}`
}
