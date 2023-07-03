import { NextFunction } from "grammy";
import { Context } from "../types.js";

export const commandsMiddleware = async (ctx: Context, next: NextFunction) => {
  if (!ctx.profile) {
    await ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
    return;
  }
  await next();
};
