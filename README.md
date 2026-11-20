# TBH — anonymous messages API

Express 5 + MongoDB (Mongoose) + Redis. Users sign up (email + OTP, or Google), share a link (`/u/<username>`), and receive anonymous or named messages from guests and other users.

## Run it

Requirements: Node 20+, MongoDB, Redis (the app refuses to start without both).

```bash
npm install
cp .env.example .env.development   # then fill in the values
npm run dev                         # NODE_ENV=development, reloads on change
npm start                           # NODE_ENV=production
```

The env file is picked by `NODE_ENV`: `.env.development` or `.env.production`.

One-off migration for databases created before the `receiverId` rename:

```bash
npm run migrate:receiverId
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | no (3000) | HTTP port |
| `APP_NAME` | yes | Sender name in emails |
| `CORS_ORIGINS` | prod: yes | Comma-separated frontend origins allowed by CORS. Empty = every origin in development, none in production (tools without an `Origin` header, like Postman, are always allowed) |
| `TRUST_PROXY` | when deployed | Number of proxies in front of the app (ex: `1`). Without it, behind a proxy every guest shares the proxy's IP for rate limits and blocking |
| `DB_URI` | yes | MongoDB connection string |
| `REDIS_URL` | yes | Redis connection string (OTP, signup sessions, rate limits, login lock, token denylist) |
| `ENC_ALGORITHM` | yes | Phone encryption cipher, ex: `aes-256-cbc` |
| `IV_LENGTH` | yes | IV length in bytes, `16` for AES |
| `ENC_KEY` | yes | Encryption key, 32 characters for AES-256. Changing it makes stored phones unreadable |
| `ACCESS_TOKEN_SIGNATURE` | yes | JWT secret for access tokens |
| `ACCESS_TOKEN_EXPIRY` | yes | Access token lifetime, seconds |
| `REFRESH_TOKEN_SIGNATURE` | yes | JWT secret for refresh tokens (must differ from the access one) |
| `REFRESH_TOKEN_EXPIRY` | yes | Refresh token lifetime, seconds |
| `IP_HASH_SECRET` | recommended | HMAC secret for guest IPs (blocking + rate limits). Falls back to `ACCESS_TOKEN_SIGNATURE` |
| `MAILER_EMAIL` | yes | Gmail address that sends the OTP |
| `MAILER_PASSKEY` | yes | Gmail app password |
| `WEB_CLIENT_ID` | for Google login | Google OAuth web client id (audience of the `idToken`) |

## Auth

- Send the access token as `Authorization: Bearer <accessToken>` (a bare token still works for old clients).
- Language: `Accept-Language: en` or `ar` for translated messages.
- The access + refresh token of one login share a session id (`jti`):
  - `POST /api/users/logout` ends that session (both tokens).
  - `POST /api/users/logout` with `{ "allDevices": true }` ends every session.
  - `POST /api/users/rotate-token` (with the **refresh** token, once the access token expired) returns a new pair and revokes the old one.
  - Deleting the account invalidates all its tokens.

## Endpoints

### Auth — `/api/auth`
| Method | Path | Body |
|---|---|---|
| POST | `/register` | `userName` ("first last"), `email`, `password`, `confirmPassword`, `phone`, `age`, `gender` → emails an OTP |
| POST | `/confirm-otp` | `email`, `otp` → creates the account |
| POST | `/resend-otp` | `email` |
| POST | `/login` | `email`, `password` → `{ accessToken, refreshToken }` |
| POST | `/signup-with-google` | `idToken` → `{ accessToken, refreshToken }` |

### Users — `/api/users`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/public/:username` | – | Public profile for the share page |
| GET | `/profile` | access | Own profile, phone decrypted |
| PATCH | `/` | access | Any of `userName`, `username`, `phone`, `age`, `gender`, `allowAnonymousMessages` |
| DELETE | `/` | access | Deletes the account + received messages; sent messages stay, anonymized |
| DELETE | `/blocked` | access | Unblock everyone |
| POST | `/logout` | access | `{ allDevices?: boolean }` |
| POST | `/rotate-token` | refresh | New token pair |

### Messages — `/api/messages`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | optional | `title`, `content`, `receiverId` **or** `receiverUsername`, `isAnonymous?` (guests are always anonymous) |
| GET | `/` | access | `type` 0 = all, 1 = sent, 2 = received; `page`, `limit` |
| GET | `/paginate-sort` | access | Inbox, `page`, `limit`, `search?` |
| GET | `/note-by-content` | access | `search`, `page`, `limit` |
| GET | `/:id` | access | Sender or receiver only |
| DELETE | `/:noteId` | access | Receiver only |
| POST / DELETE | `/:noteId/block-sender` | access | Receiver blocks / unblocks the sender without seeing who it is |
| POST | `/:noteId/report` | access | `{ reason? }`, receiver only |

## Errors

Every error is `{ status: "fail" | "error", error, message }` with a proper status code:
400 validation / bad id, 401 auth, 403 forbidden, 404, 409 duplicate value / stale write, 413 body too large, 429 rate limit (`Retry-After` header), 503 Redis down (auth routes). In production a 500 never includes internal details.

## Postman

Import `TBH app.postman_collection.json`. Set the collection variables `baseUrl`, then run **login** — its test script stores `accessToken` / `refreshToken`, and every request uses `Bearer {{accessToken}}`.
