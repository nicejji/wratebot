import { Context } from "../../types.js";

const edit = async (ctx: Context) => {
  await ctx.conversation.enter("register");
};

export default edit;
