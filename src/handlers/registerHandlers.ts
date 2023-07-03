import { Bot } from "grammy";
import { Context } from "../types.js";
import edit from "./commands/edit.js";
import likes from "./commands/likes.js";
import profile from "./commands/profile.js";
import search from "./commands/search.js";
import start from "./commands/start.js";

const registerHandlers = async (bot: Bot<Context>) => {
  await bot.api.setMyCommands([
    { command: "search", description: "🔎 Поиск пользователей" },
    { command: "likes", description: "❤️ Полученные лайки" },
    { command: "profile", description: "👤 Мой профиль" },
    { command: "edit", description: "✏️ Редактировать профиль" },
  ]);
  const pm = bot.chatType("private");
  pm.command("start", start);
  pm.command("profile", profile);
  pm.command("edit", edit);
  pm.command("search", search);
  pm.command("likes", likes);
};

export default registerHandlers;
