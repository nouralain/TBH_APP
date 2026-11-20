// C5: very basic content moderation for anonymous messages.
// it's intentionally simple (a word list + link detection), not a real moderation system.

// links: http(s)://..., www...., or something.tld (example.com, bit.ly/xyz)
const LINK_REGEX = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|io|ly|me|co|app|xyz|info|link|gg|tk|ru|eg)\b/i

// keep the list short and obvious, extend it as needed.
// words are matched as whole words (EN) / whole tokens (AR), case-insensitive
const BAD_WORDS = [
  // EN
  "fuck", "fucking", "shit", "bitch", "bastard", "asshole", "cunt", "dick", "whore", "slut",
  // AR
  "كلب", "حمار", "حيوان", "زبالة", "وسخ", "شرموط", "شرموطة", "عاهرة", "خول", "متناك",
]

// \b doesn't work with Arabic letters, so we split on anything that's not a letter/number
const tokenize = (text) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)

const badWordsSet = new Set(BAD_WORDS)

export const containsLink = (text = "") => LINK_REGEX.test(text)

// also checks the Arabic word without the "ال" prefix (الحمار -> حمار)
export const containsBadWord = (text = "") =>
  tokenize(text).some((word) => badWordsSet.has(word) || (word.startsWith("ال") && badWordsSet.has(word.slice(2))))
