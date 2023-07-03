import { Context } from "../../types.js";

const start = async (ctx: Context) => {
  await ctx.reply("Добро пожаловать! 😉");
};

export default start;
