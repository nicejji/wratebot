import { sendProfile } from "../../helpers.js";
import { Context } from "../../types.js";

const profile = async (ctx: Context) => {
  if (!ctx.profile) {
    await ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
    return;
  }
  await ctx.reply("👤 Так выглядит ваш профиль:");
  await sendProfile(ctx, ctx.profile);
};

export default profile;
