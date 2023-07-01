import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { Keyboard } from "grammy";
import prisma from "../prisma.js";
import { sendProfile } from "../helpers.js";

type MyConversation = Conversation<MyContext>;

const recieveIsFemale = async (ctx: MyContext, conv: MyConversation) => {
  const keyboard = new Keyboard()
    .text("Мужской 🙋‍♂️")
    .text("Женский 🙋‍♀️")
    .resized();
  await ctx.reply("Выбери свой пол", { reply_markup: keyboard });
  while (true) {
    const gender = await conv.form.text();
    if (gender === "Мужской 🙋‍♂️" || gender === "Женский 🙋‍♀️")
      return gender === "Женский 🙋‍♀️";
    await ctx.reply("Выбери из предложенных!");
  }
};

const recievePhoto = async (ctx: MyContext, conv: MyConversation) => {
  const keyboard = new Keyboard().resized().text("Оставить текущее").oneTime();
  const prevPhoto = ctx?.profile?.photo;
  await ctx.reply("Отправь свое фото 📷", {
    reply_markup: prevPhoto ? keyboard : { remove_keyboard: true },
  });
  while (true) {
    const photosCtx = await conv.waitFor([":photo", ":text"]);
    const text = photosCtx?.msg?.text;
    const photo = photosCtx?.msg?.photo;
    if (text === "Оставить текущее" && prevPhoto) return prevPhoto;
    if (photo) return photo[0].file_id;
    if (!photo) await ctx.reply("Отправь фото!");
  }
};

const recieveConfirm = async (ctx: MyContext, conv: MyConversation) => {
  if (!ctx.profile) return true;
  const keyboard = new Keyboard()
    .resized()
    .oneTime()
    .text("Да")
    .text("Оставить прошлую анкету");
  await ctx.reply("Ваши оценки будут обнулены, вы хотите продолжить?", {
    reply_markup: keyboard,
  });
  while (true) {
    const confirm = await conv.form.text();
    if (confirm === "Да" || confirm === "Оставить прошлую анкету")
      return confirm === "Да";
    await ctx.reply("⚠️ Нет такой опции!");
  }
};

export const register = async (
  conversation: MyConversation,
  ctx: MyContext
) => {
  const confirm = await recieveConfirm(ctx, conversation);
  if (!confirm) return;
  await prisma.grade.deleteMany({
    where: { toId: ctx.from.id },
  });
  const userData = {
    isFemale: await recieveIsFemale(ctx, conversation),
    photo: await recievePhoto(ctx, conversation),
  };
  const profile = await prisma.user.upsert({
    where: { tgId: ctx.from.id },
    update: userData,
    create: { tgId: ctx.from.id, ...userData },
  });
  await ctx.reply("👤 Ваш профиль обновлен:");
  await sendProfile(ctx, profile);
};
