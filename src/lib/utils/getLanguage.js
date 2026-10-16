import { languagesEnum } from "../enum/languages.enum.js";

export const getLang = (req) => {
    const header = req.headers["accept-language"];
    if (!header) return languagesEnum.EN;
    const primary = header.split(",")[0].split("-")[0].toLowerCase();
    return Object.values(languagesEnum).includes(primary) ? primary : languagesEnum.EN;
  };