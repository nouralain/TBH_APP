import { OAuth2Client } from "google-auth-library";
import { WEB_CLIENT_ID } from "../../config.js";
import { BadRequestException } from "../../pkg/errors/error.exception.js";

const client = new OAuth2Client();
export async function verifyTokenId(idToken) {
  try {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
    });
  
   const payload =  ticket.getPayload();
    
   if(!payload.email_verified)throw BadRequestException("Email not verified")
      return payload
  } catch (error) {
console.log(error);
    
  }
}
