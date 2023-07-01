import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { User } from "@prisma/client";
import prisma from "../prisma.js";
import { Keyboard } from "grammy";

type MyConversation = Conversation<MyContext>;

const findCandidate = async (forUser: User) => {
  const extendedUser = await prisma.user.findUnique({
    where: { tgId: forUser.tgId },
    include: { sentGrades: true, recievedGrades: true },
  });
  const excludeIds = [
    ...extendedUser.sentGrades.map((g) => g.toId),
    forUser.tgId,
  ];
  return await prisma.user.findFirst({
    where: { tgId: { notIn: excludeIds }, isFemale: !forUser.isFemale },
  });
};

const rateKeyboard = new Keyboard()
  .resized()
  .text("1")
  .text("2")
  .text("3")
  .text("4")
  .text("5")
  .row()
  .text("6")
  .text("7")
  .text("8")
  .text("9")
  .text("10")
  .row()
  .text("⬅️ Закончить просмотр анкет.");

const recievePoints = async (ctx: MyContext, conv: MyConversation) => {
  while (true) {
    const points = await conv.form.text();
    if (points === "⬅️ Закончить просмотр анкет.") return null;
    if ([1, 2, 3, 4, 5, 6, 7, 8, 9].find((n) => parseInt(points) === n))
      return parseInt(points);
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
    await ctx.replyWithPhoto(candidate.photo);
    const points = await recievePoints(ctx, conversation);
    if (points === null) {
      await ctx.reply("Вы закончили просмотр анкет ✅", {
        reply_markup: { remove_keyboard: true },
      });
      return;
    }
    await prisma.grade.create({
      data: { fromId: ctx.from.id, toId: candidate.tgId, points },
    });
    const toId = Number(candidate.tgId);
    await ctx.api.sendMessage(toId, "❤️ Вы получили новую оценку!");
  }
};
