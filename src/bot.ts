import { conversations, createConversation } from "@grammyjs/conversations";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { Bot, session } from "grammy";
import { likes } from "./conversations/likes.js";
import { register } from "./conversations/register.js";
import { search } from "./conversations/search.js";
import env from "./env.js";
import registerHandlers from "./handlers/registerHandlers.js";
import { profileMiddleware } from "./middleware/profile.js";
import prisma from "./prisma.js";
import { Context } from "./types.js";

const bot = new Bot<Context>(env.BOT_TOKEN);
bot.use(
  session({ initial: () => ({}), storage: new PrismaAdapter(prisma.session) }),
);
bot.use(profileMiddleware);
bot.use(conversations());
bot.use(createConversation(register));
bot.use(createConversation(search));
bot.use(createConversation(likes));
registerHandlers(bot);

export default bot;
