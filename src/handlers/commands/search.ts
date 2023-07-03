import { Context } from "../../types.js";

const search = async (ctx: Context) => {
  await ctx.conversation.enter("search");
};

export default search;
