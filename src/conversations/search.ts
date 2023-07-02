import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { User } from "@prisma/client";
import prisma from "../prisma.js";
import { sendProfile } from "../helpers.js";
import { Keyboard } from "grammy";

type MyConversation = Conversation<MyContext>;

const findCandidate = async (forUser: User) => {
  const extendedUser = await prisma.user.findUnique({
    where: { tgId: forUser.tgId },
    include: { sentGrades: true, recievedGrades: true },
  });
  const excludeIds = [
    ...extendedUser.sentGrades.map((g) => g.toId),
    ...extendedUser.recievedGrades.map((g) => g.fromId),
    forUser.tgId,
  ];
  return await prisma.user.findFirst({
    where: { tgId: { notIn: excludeIds }, isFemale: !forUser.isFemale },
    orderBy: {
      _relevance: { fields: ["city"], search: forUser.city, sort: "asc" },
    },
  });
};

const rateKeyboard = new Keyboard()
  .resized()
  .text("❤️")
  .text("👎")
  .row()
  .text("⬅️ Закончить просмотр анкет.");

const recieveIsLike = async (ctx: MyContext, conv: MyConversation) => {
  while (true) {
    const reaction = await conv.form.text();
    if (reaction === "⬅️ Закончить просмотр анкет.") return null;
    if (reaction === "❤️" || reaction === "👎") return reaction === "❤️";
    await ctx.reply("Нет такой опции!");
  }
};

export const search = async (conversation: MyConversation, ctx: MyContext) => {
  await ctx.reply("🔎 Поиск пользователей ...", { reply_markup: rateKeyboard });
  while (true) {
    const candidate = await findCandidate(ctx.profile);
    if (!candidate) {
      await ctx.reply("⚠️ Все профили просмотрены!", {
        reply_markup: { remove_keyboard: true },
      });
      break;
    }
    await sendProfile(ctx, candidate);
    const isLike = await recieveIsLike(ctx, conversation);
    if (isLike === null) {
      await ctx.reply("Вы закончили просмотр анкет ✅", {
        reply_markup: { remove_keyboard: true },
      });
      return;
    }
    const grade = await prisma.grade.create({
      data: { fromId: ctx.from.id, toId: candidate.tgId, isLike },
    });
    if (grade.isLike) {
      const toId = Number(candidate.tgId);
      await ctx.api.sendMessage(toId, "❤️ Вы получили новый лайк!");
    }
  }
};
