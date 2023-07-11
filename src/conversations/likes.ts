import { User } from "@prisma/client";
import { Keyboard } from "grammy";
import { escapeMarkdown, sendProfile } from "../helpers.js";
import prisma from "../prisma.js";
import { Context, Conversation } from "../types.js";

const rateKeyboard = new Keyboard()
  .resized()
  .text("❤️")
  .text("👎")
  .text("⬅️ Закончить просмотр анкет.");

const recieveIsLike = async (ctx: Context, conv: Conversation) => {
  while (true) {
    const reaction = await conv.form.text();
    if (reaction === "⬅️ Закончить просмотр анкет.") return null;
    if (reaction === "❤️" || reaction === "👎") return reaction === "❤️";
    await ctx.reply("Нет такой опции!");
  }
};

const getLikers = async (user: User) =>
  (
    await prisma.user.findUnique({
      where: { tgId: user.tgId },
      include: { recievedGrades: { include: { from: true } } },
    })
  )?.recievedGrades
    .filter((grade) => grade.isLike && !grade.isMatch)
    .map((grade) => grade.from) ?? [];

const handleMatch = async (ctx: Context, from: User) => {
  if (!ctx.profile) return;
  await ctx.reply(
    `Отлично, переходите общаться 👉 [${escapeMarkdown(
      from.name
    )}](https://t.me/${from.username})`,
    {
      parse_mode: "MarkdownV2",
    }
  );
  await sendProfile(ctx, ctx.profile, Number(from.tgId));
  await ctx.api.sendMessage(
    Number(from.tgId),
    `Есть взаимная симпатия, переходите общаться 👉 [${escapeMarkdown(
      ctx.profile.name
    )}](https://t.me/${ctx.profile.username})`,
    { parse_mode: "MarkdownV2" }
  );
};

export const likes = async (conversation: Conversation, ctx: Context) => {
  if (!ctx.profile) return;
  const profiles = await getLikers(ctx.profile);
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
    if (isMatch === null) {
      await ctx.reply("Вы закончили просмотр анкет ✅", {
        reply_markup: { remove_keyboard: true },
      });
      return;
    }
    const grade = await prisma.grade.update({
      where: { fromId_toId: { fromId: profile.tgId, toId: ctx.profile.tgId } },
      data: { isMatch },
    });
    if (grade.isMatch) await handleMatch(ctx, profile);
  }
  await ctx.reply("✅ Все лайки просмотрены!", {
    reply_markup: { remove_keyboard: true },
  });
};
