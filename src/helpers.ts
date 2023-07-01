import { User } from "@prisma/client";
import { MyContext } from "./context.js";
import prisma from "./prisma.js";

export const sendLikes = async (ctx: MyContext) => {
  const extendedUser = await prisma.user.findUnique({
    where: { tgId: ctx.profile.tgId },
    include: { recievedGrades: { include: { from: true } } },
  });
  const grades = extendedUser.recievedGrades.filter((g) => !g.isViewed);
  if (!grades.length) {
    await ctx.reply("⚠️ Все оценки просмотрены!");
    return;
  }
  await ctx.reply("❤️  Вам поставили оценки следующие пользователи:");
  for (const grade of grades) {
    await ctx.replyWithPhoto(grade.from.photo, {
      caption: `Оценил(а) вас на ${grade.points} / 10`,
    });
    await prisma.grade.update({
      where: {
        fromId_toId: { fromId: grade.from.tgId, toId: ctx.profile.tgId },
      },
      data: { isViewed: true },
    });
  }
  await ctx.reply("✅ Все оценки просмотрены!", {
    reply_markup: { remove_keyboard: true },
  });
};

export const sendProfile = async (
  ctx: MyContext,
  profile: User,
  toId?: number
) => {
  const extendedUser = await prisma.user.findUnique({
    where: { tgId: profile.tgId },
    include: { recievedGrades: true },
  });
  const grades = extendedUser.recievedGrades.map((g) => g.points);
  const average = grades.reduce((p, c) => p + c, 0) / grades.length;
  const text = grades.length
    ? `Среднаяя оценка: ${average} / 10. Вас оценило ${grades.length} человек.`
    : "Вас пока никто не оценил.";
  await ctx.api.sendPhoto(toId ?? ctx.from.id, profile.photo, {
    caption: text,
  });
};
