import { Context } from "../../types.js";

const search = async (ctx: Context) => {
  if (!ctx.profile) {
    await ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
    return;
  }
  await ctx.conversation.enter("search");
};

export default search;
