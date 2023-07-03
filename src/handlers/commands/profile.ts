import { sendProfile } from "../../helpers.js";
import { Context } from "../../types.js";

const profile = async (ctx: Context) => {
  await ctx.reply("👤 Так выглядит ваш профиль:");
  await sendProfile(ctx, ctx.profile);
};

export default profile;
