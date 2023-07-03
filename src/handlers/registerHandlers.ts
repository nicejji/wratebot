import { Bot } from "grammy";
import { commandsMiddleware } from "../middleware/commands.js";
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
  pm.command("start", commandsMiddleware, start);
  pm.command("profile", commandsMiddleware, profile);
  pm.command("edit", commandsMiddleware, edit);
  pm.command("search", commandsMiddleware, search);
  pm.command("likes", commandsMiddleware, likes);
};

export default registerHandlers;
