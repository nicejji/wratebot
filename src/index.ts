import dotenv from "dotenv";
import { Bot, session } from "grammy";
import {PrismaAdapter} from "@grammyjs/storage-prisma";
import {conversations, createConversation} from "@grammyjs/conversations"
import {PrismaClient} from "@prisma/client";

import { MyContext, SessionData } from "./context.js"
import { movie } from "./conversations/movie.js"

dotenv.config();

const prisma = new PrismaClient();

const bot = new Bot<MyContext>(process.env.BOT_TOKEN);
bot.use(session({ 
  initial: () => ({ pizzaCount: 0 }), 
  storage: new PrismaAdapter<SessionData>(prisma.session) 
}));
bot.use(conversations())
bot.use(createConversation(movie))

const pm = bot.chatType("private");
pm.command("hunger", (ctx) =>
  ctx.reply(`Your hunger level is ${ctx.session.pizzaCount}`)
);
pm.command("movie", ctx => ctx.conversation.enter("movie"))

pm.hears(/.*🍕.*/, (ctx) => ctx.session.pizzaCount++);

bot.start();
