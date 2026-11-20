import { OAuth2Client } from "google-auth-library";
import { WEB_CLIENT_ID } from "../../config.js";
import { UnauthorizedException } from "../../pkg/errors/error.exception.js";

const client = new OAuth2Client();

/** Verifies a Google idToken and returns its payload. Throws 401 on any failure. */
export async function verifyTokenId(idToken, lang) {
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: WEB_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (error) {
    throw new UnauthorizedException("Invalid Google token", lang);
  }

  if (!payload?.email || !payload.email_verified) {
    throw new UnauthorizedException("Google email is not verified", lang);
  }
  return payload;
}
