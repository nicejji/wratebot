import { Context } from "../../types.js";

const likes = async (ctx: Context) => {
  await ctx.conversation.enter("likes");
};

export default likes;
