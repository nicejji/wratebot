import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";

type MyConversation = Conversation<MyContext>;

export const movie = async (conversation: MyConversation, ctx: MyContext) => {
  await ctx.reply("How many favorite movies do you have?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Tell me number ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Here is a better ranking!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
};
