# TBH App — Tickets

Branch: `messages-hardening` (cut from `messages`, including your uncommitted WIP).

Priority: **P0** = broken / security hole, **P1** = important gap, **P2** = nice to have.
Size: S (< 1h), M (a few hours), L (a day+).

---

## Epic A — Broken things to fix first (P0) — ✅ DONE
> All A1–A12 fixed on `messages-hardening`. Schema/router/middleware checks pass; the DB-backed flows (register → OTP email, Google login, token refresh) still need a manual run with Postman.

### A1. Validation middleware rejects every GET request — P0 · S
`src/lib/middlewares/validation.middleware.js:412` throws when `req.body` is missing. In Express 5, `req.body` is `undefined` on GET/DELETE, so **all message GET routes and DELETE fail with 400**.
- Remove the `!req.body` check; pass `req.body ?? {}`.
- Done when: `GET /api/messages`, `GET /api/messages/:id`, `DELETE /api/messages/:id` pass validation.

### A2. Message route order shadows static routes — P0 · S
`src/modules/message/router/message.router.js`: `PATCH /all` is declared after `PATCH /:noteId`, and `GET /note-by-content` after `GET /:id`, so they are never reached (they fail with "Invalid ID").
- Declare static paths (`/all`, `/paginate-sort`, `/note-by-content`) before param paths.

### A3. Translations never resolve in message validation — P0 · S
`src/modules/message/schema/translation.validation.js` uses keys `EN`/`AR`, but `lang` is `"en"`/`"ar"`, so every message is `undefined`. Also Zod v4 dropped `required_error` / `errorMap` (use `error`), so custom messages are ignored in message schemas **and** `gender` in `generalValidation.js`.
- Unify on `languagesEnum` keys and Zod v4 `error` option.

### A4. Password confirmation is never checked on signup — P0 · S
`confermFields` in `src/lib/utils/generalValidation.js` uses the comma operator, so it always returns a truthy object → `password !== confirmPassword` still signs up.
- Return a boolean and use `.refine(fn, { message, path })` properly.

### A5. OTP email goes to a hard-coded address — P0 · S
`GenerateOtpAndSendEmail` in `auth.services.js` sends to `nunaahmed74@gmail.com` instead of the registering user, and isn't awaited (an SMTP failure becomes an unhandled rejection / silent failure).
- Send to `email`, await it (or queue + catch), make the template say the real TTL (it says 10 min, TTL is 120s).

### A6. Google sign-up issues tokens without a user id — P0 · S
`signupWithGoogleService` → for new users calls `getLoginCredintials({payload:{userName:name}, id:sub})`; `id` is ignored and `sub` is missing, so the token fails on every authenticated route. Google's `sub` isn't the Mongo `_id` anyway.
- Use the created user's `_id` as `sub`. Also handle single-word Google names (lastName required → crash).

### A7. `verifyTokenId` swallows errors — P0 · S
`throw BadRequestException(...)` has no `new`, and the `catch` logs and returns `undefined` → destructuring crashes with 500. The route also has no Zod validation.
- Throw `UnauthorizedException`, add `idToken` schema.

### A8. Refresh-token rotation always throws — P0 · S
`rotateToken` re-signs `payload` which still contains `iat`/`exp`; `jwt.sign` with `expiresIn` throws "payload already has exp".
- Build a fresh payload `{ sub, userName }`.

### A9. `PATCH /api/users` can never succeed — P0 · S
`updateSchema` isn't wrapped in `{ body: ... }`, so Zod strips everything and the "at least one field" refine always fails. Also phone isn't encrypted on update and `firstName/lastName` + `userName` are both sent.
- Wrap in `body`, encrypt phone, drop `userName` after splitting.

### A10. Login crashes for Google accounts / `select:-password` bug — P0 · S
`select: -password` evaluates to `NaN` (it's the variable, not a string). Logging in with email/password for a Google user calls `bcrypt.compare(x, undefined)` → 500.
- Use `select: "+password"` (and `select:false` on the schema), reject non-SYSTEM providers with a clear message.

### A11. Optional-auth middleware in message router — P0 · S
The inline middleware on `POST /api/messages` references undefined `lang`, and an invalid/expired token produces a 500 instead of 401.
- Extract to `optionalAuthentication()` in `authentication.middleware.js` reusing the same error mapping.

### A12. 404 handler isn't a catch-all — P1 · S
`app.all("{/dummy}")` only matches `/` and `/dummy`. Use `app.use((req,res)=>...)` or `"/{*splat}"`. Also `app.listen` runs inside `bootstrapDB` before routes are mounted — move it to `main.js` after routes.

---

## Epic B — Anonymous vs. named messages (core feature) — ✅ DONE
> On branch `epic-b-anonymous-messages`.
> - **B5 decision:** messages can't be edited at all → `PATCH /:noteId`, `PUT /replace/:noteId`, `PATCH /all` removed.
> - **B6 decision:** renamed to `receiverId`. Run `npm run migrate:receiverId` once against each database.
> - **Q3 decision (C6 partly pulled in):** receivers can turn off anonymous messages (`allowAnonymousMessages`) and block senders
>   by message (`POST|DELETE /api/messages/:noteId/block-sender`, `DELETE /api/users/blocked` to clear all). Guests can't be blocked yet (no account → needs IP-based blocking, still in C6).
> - Users created before B4 have no `username` until they set one with `PATCH /api/users`.

### B1. Explicit `isAnonymous` flag — P0 · M
Today "anonymous" just means "no token". A logged-in user can't choose to be anonymous, and when they are logged in their `senderId` is returned to the receiver by `GET /`, `GET /:id`, `paginate-sort` → **anonymity leaks**.
- Add `isAnonymous: Boolean` to the model + create schema (default `true`).
- Guests: forced `isAnonymous = true`, no `senderId`.
- Logged-in: store `senderId` always (so they can edit/see their sent list), but **never expose it to the receiver** when `isAnonymous`.

### B2. Response serializer per viewer — P0 · M
One `toMessageDTO(message, viewerId)` used by every read endpoint:
- Receiver + anonymous → no sender info.
- Receiver + named → `sender: { id, userName }` (populate, no email/phone).
- Sender → sees everything incl. receiver name.
- Remove `getOneService` returning `{ note, userId }`.

### B3. Business rules on send — P1 · S
- Can't send to yourself (`cannotSendToSelf` translation already exists, unused).
- Receiver must exist (use `receiverNotFound` message, not `" not found"`).
- Optional: receiver can turn off anonymous messages / all messages (see questions).

### B4. Public receiver profile / share link — P1 · M
Senders need a way to find the receiver without knowing a Mongo id.
- Add a unique `username` (slug) to users, `GET /api/users/:username/public` → `{ id, userName }` only.
- `POST /api/messages` accepts `receiverUsername` or `receiverId`.

### B5. Clean up edit/delete permissions — P1 · S
- Edit/replace: only sender, only if sent while logged in. Consider an edit window (e.g. 15 min) or "edited" flag so senders can't rewrite a message after it was read.
- Delete: receiver only (already), consider soft delete.
- `PATCH /all` (update all titles) — confirm it's still wanted; it's an assignment requirement but weird in product terms.

### B6. Rename `reciverId` → `receiverId` — P2 · S
Typo across model, schema, services. Do it now before the frontend depends on it (+ migration script for existing docs).

---

## Epic C — Restrictions & validation

### C1. Field limits on messages — P0 · S
No `max` on title/content → someone can post megabytes. Add e.g. title ≤ 100, content ≤ 1000 chars, in Zod **and** Mongoose. Add `express.json({ limit: "10kb" })`.

### C2. Regex injection in search — P0 · S
`paginateService` / `getByContentService` put user input straight into `$regex` → ReDoS / wildcard abuse. Escape input (or use a `$text` index) and cap search length.

### C3. Pagination everywhere — P1 · S
`GET /api/messages` (type 0/1/2) returns everything unpaginated. Reuse `paging`. `note-by-content` should return an empty list, not 404.

### C4. Indexes — P1 · S
`{ receiverId: 1, createdAt: -1 }`, `{ senderId: 1, createdAt: -1 }`. Call `syncIndexes` for MessageModel too.

### C5. Content moderation (basic) — P2 · M
Bad-word filter / link blocking for anonymous messages, and a "report message" endpoint for receivers.

### C6. Block senders — P2 · M
Receiver can block a named sender (by user id). For anonymous, optionally block by hashed IP/fingerprint. Blocked sends fail silently or with 403.

---

## Epic D — Rate limiting (Redis, already in the stack)

### D1. Generic Redis rate-limit middleware — P0 · M
`rateLimit({ keyPrefix, windowSec, max, keyBy })` using `INCR` + `EXPIRE` (fixed window) or a sliding window with a sorted set. Returns 429 + `Retry-After` header, translated message. Key by user id when authenticated, else by IP (`app.set("trust proxy", ...)` when deployed).

### D2. Apply limits — P0 · S (suggested defaults, tweak freely)
| Route | Key | Limit |
|---|---|---|
| `POST /api/messages` (guest) | IP | 5 / 10 min |
| `POST /api/messages` (logged in) | user | 20 / 10 min |
| `POST /api/messages` per receiver | IP or user + receiver | 3 / hour |
| `POST /auth/login` | IP + email | 5 / 15 min, then lock |
| `POST /auth/register`, `/resend-otp` | IP | 5 / hour |
| `POST /auth/confirm-otp` | email | 5 wrong tries → OTP invalidated |
| Global fallback | IP | 100 / min |

### D3. OTP brute-force protection — P0 · S
`confirmOtpService` allows unlimited guesses on a 6-digit code. Count failed attempts in Redis, delete the OTP after N failures. Fix `trials > 3` off-by-one in resend.

### D4. Fail-safe when Redis is down — P1 · S
`connectRedis` swallows connection errors, then OTP/rate-limit calls throw later. Either fail startup or fail-closed with 503 on auth routes.

---

## Epic E — Security & housekeeping

### E1. Remove sensitive logs — P0 · S
`console.log` of JWT payloads, Google idTokens, encryption IVs, user docs, `trials`, etc. Replace with a small logger that's silent in production.

### E2. Error handler improvements — P1 · S
- Map Mongoose `CastError` → 400, duplicate key `11000` → 409, `ValidationError` → 400, `VersionError` → 409.
- Don't send `cause` on 500 in production.

### E3. HTTP hardening — P1 · S
`helmet`, CORS restricted to the frontend origin (env var), accept `Authorization: Bearer <token>` (Angular currently sends `Hamada__<token>` which the backend doesn't parse).

### E4. Delete account cascade — P1 · S
`DELETE /api/users` leaves the user's received messages behind. Delete received messages; anonymize sent ones.

### E5. Logout / token revocation — P2 · M
Store a `credentialsChangedAt` or a Redis denylist by `jti` so logout and account deletion invalidate refresh tokens.

### E6. Phone decryption — P2 · S
There's `encrypt` but no `decrypt`, so the phone can never be shown back to its owner.

### E7. Translation cleanup — P2 · S
Several messages are hard-coded English (`"done"`, `"Profile not found"`, `USER_CREATED` uses EN for both branches). Add a `t(key, lang)` helper.

### E8. Update Postman collection + README with env vars — P2 · S

---

## Epic F — Frontend (Next.js, App Router, Tailwind)

### F1. Scaffold `frontend/` with Next.js — P1 · M
API client with token storage + auto refresh, i18n (EN/AR with RTL), env `NEXT_PUBLIC_API_URL`.

### F2. Auth pages — P1 · M
Register → OTP confirm (with resend + countdown) → Login, Google sign-in button.

### F3. Public "send me a message" page `/u/[username]` — P1 · M
Title + content, character counters, **"Send anonymously" toggle** (forced on for guests), success screen, 429 handling.

### F4. Inbox — P1 · M
Paginated received messages, search, open/delete, sender name or "Anonymous".

### F5. Sent messages — P1 · S
List of messages I sent with edit/replace (within edit window).

### F6. Profile / settings — P2 · M
Update profile, copy share link, privacy toggles (accept anonymous messages), delete account.

---

## Open questions (need your answers before I start)
See the chat — I'll update this file with your decisions.
