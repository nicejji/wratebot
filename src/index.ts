import dotenv from "dotenv";
import { Bot } from "grammy";

import { MyContext } from "./context.js";

dotenv.config();

const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

const pm = bot.chatType("private");

pm.on("message", (ctx) => ctx.reply("hello world"));

bot.start();
