import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { Keyboard } from "grammy";
import prisma from "../prisma.js";
import { sendProfile } from "../helpers.js";

type MyConversation = Conversation<MyContext>;

const rateKeyboard = new Keyboard().resized().text("❤️").text("👎");

const recieveIsLike = async (ctx: MyContext, conv: MyConversation) => {
  while (true) {
    const reaction = await conv.form.text();
    if (reaction === "❤️" || reaction === "👎") return reaction === "❤️";
    await ctx.reply("Нет такой опции!");
  }
};

export const likes = async (conversation: MyConversation, ctx: MyContext) => {
  const extendedUser = await prisma.user.findUnique({
    where: { tgId: ctx.profile.tgId },
    include: { recievedGrades: { include: { from: true } } },
  });
  const profiles = extendedUser.recievedGrades
    .filter((g) => g.isLike && !g.isMatch)
    .map((g) => g.from);
  if (!profiles.length) {
    await ctx.reply("⚠️ Все лайки просмотрены!");
    return;
  }
  await ctx.reply("❤️  Вам поставили лайк следующие пользователи:", {
    reply_markup: rateKeyboard,
  });
  for (const profile of profiles) {
    await sendProfile(ctx, profile);
    const isMatch = await recieveIsLike(ctx, conversation);
    const grade = await prisma.grade.update({
      where: { fromId_toId: { fromId: profile.tgId, toId: ctx.profile.tgId } },
      data: { isMatch },
    });
    if (grade.isMatch) {
      await ctx.reply(`Отлично, переходите общаться @${profile.username}`);
      await sendProfile(ctx, ctx.profile, Number(profile.tgId));
      await ctx.api.sendMessage( Number(profile.tgId), `Есть взаимная симпатия, переходите общаться @${ctx.profile.username}`);
    }
  }
  await ctx.reply("✅ Все лайки просмотрены!", {
    reply_markup: { remove_keyboard: true },
  });
};
