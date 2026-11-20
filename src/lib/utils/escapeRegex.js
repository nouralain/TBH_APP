// C2: turns user input into a literal pattern for $regex.
// "a.*" becomes "a\.\*" -> it only matches the text "a.*", it can't be used as a wildcard
// or to build a slow (ReDoS) pattern.
export const escapeRegex = (text = "") => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
