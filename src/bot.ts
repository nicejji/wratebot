import dotenv from "dotenv";
import { Bot, session } from "grammy";
import { MyContext } from "./context.js";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { conversations, createConversation } from "@grammyjs/conversations";
import { register } from "./conversations/register.js";
import prisma from "./prisma.js";
import { profileMiddleware } from "./middleware/profile.js";
import { search } from "./conversations/search.js";

dotenv.config();
const bot = new Bot<MyContext>(process.env.BOT_TOKEN);
bot.use(
  session({ initial: () => ({}), storage: new PrismaAdapter(prisma.session) })
);
bot.use(profileMiddleware);
bot.use(conversations());
bot.use(createConversation(register));
bot.use(createConversation(search));

export default bot;
