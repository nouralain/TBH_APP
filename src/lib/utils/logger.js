// E1: tiny logger instead of console.* all over the code.
// - debug / info: only in development (silent in production and in tests)
// - warn / error: always, but callers pass short messages, never tokens, OTPs, IVs or user documents
const NODE_ENV = process.env.NODE_ENV ?? "development"
const isProduction = NODE_ENV === "production"

const stamp = () => new Date().toISOString()

export const logger = {
  debug: (...args) => { if (!isProduction) console.debug(stamp(), "[debug]", ...args) },
  info: (...args) => { if (!isProduction) console.info(stamp(), "[info]", ...args) },
  warn: (...args) => console.warn(stamp(), "[warn]", ...args),
  error: (...args) => console.error(stamp(), "[error]", ...args),
}

// for an unexpected error: in production only name + message (a stack or a Mongo error can
// carry query values / documents), in development the whole error to debug it.
export const describeError = (err) => (isProduction ? `${err?.name}: ${err?.message}` : err)
