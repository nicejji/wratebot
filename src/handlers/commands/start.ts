import { Context } from "../../types.js";

const start = async (ctx: Context) => {
  if (ctx.profile) {
    await ctx.reply("Добро пожаловать снова! 😉");
  } else {
    await ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
  }
};

export default start;
