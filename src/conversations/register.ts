import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { Keyboard } from "grammy";
import prisma from "../prisma.js";
import { sendProfile } from "../helpers.js";

type MyConversation = Conversation<MyContext>;

const recieveName = async (ctx: MyContext, conv: MyConversation) => {
  const keyboard = new Keyboard().resized();
  const prevName = ctx?.profile?.name;
  const tgName = ctx?.from?.first_name;
  if (prevName) keyboard.text(prevName);
  if (tgName) keyboard.text(tgName);
  await ctx.reply("Введите ваше имя 👤", {
    reply_markup: tgName || prevName ? keyboard : { remove_keyboard: true },
  });
  while (true) {
    const name = await conv.form.text();
    if (name.length < 30) return name;
    await ctx.reply("⚠️ Имя должно быть короче 30 символов!");
  }
};

const recieveAge = async (ctx: MyContext, conv: MyConversation) => {
  const prevAge = ctx?.profile?.age;
  await ctx.reply("Введите ваш возраст 🔢", {
    reply_markup: prevAge
      ? new Keyboard().resized().text(`${prevAge}`)
      : { remove_keyboard: true },
  });
  while (true) {
    const age = await conv.form.int();
    if (age > 15 && age < 100) return age;
    await ctx.reply("⚠️ Возраст слишком мал или велик!");
  }
};

const recieveCity = async (ctx: MyContext, conv: MyConversation) => {
  const keyboard = new Keyboard().text("Полоцк").text("Новополоцк").resized();
  await ctx.reply("Выберите свой город 🏙️", { reply_markup: keyboard });
  while (true) {
    const city = await conv.form.text();
    if (city === "Полоцк" || city === "Новополоцк") return city;
    await ctx.reply("⚠️ Выбери город из предложенных!");
  }
};

const recieveBio = async (ctx: MyContext, conv: MyConversation) => {
  const keyboard = new Keyboard().text("Оставить текущее").resized();
  const prevBio = ctx?.profile?.bio;
  await ctx.reply("Расскажи что-нибудь о себе 📝", {
    reply_markup: prevBio ? keyboard : { remove_keyboard: true },
  });
  while (true) {
    const bio = await conv.form.text();
    if (bio === "Оставить текущее" && prevBio) return prevBio;
    if (bio.length < 70) return bio;
    await ctx.reply("⚠️ Описание должно быть короче 70 символов.");
  }
};

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

const recievePhotos = async (ctx: MyContext, conv: MyConversation) => {
  const photos: string[] = [];
  const keyboard = new Keyboard().resized().text("Оставить текущее").oneTime();
  const prevPhotos = ctx?.profile?.photos;
  await ctx.reply("Отправь свое фото 📷", {
    reply_markup: prevPhotos ? keyboard : { remove_keyboard: true },
  });
  while (true) {
    const photosCtx = await conv.waitFor([":photo", ":text"]);
    const text = photosCtx?.msg?.text;
    const photo = photosCtx?.msg?.photo;
    if (text === "Оставить текущее" && prevPhotos) return prevPhotos;
    if (photos.length && text === "Это все, сохранить ✅") return photos;
    if (!photo) {
      await ctx.reply("Отправь фото!");
      continue;
    }
    photos.push(photo[0].file_id);
    if (photos.length > 2) return photos;
    const keyboard = new Keyboard()
      .text("Это все, сохранить ✅")
      .oneTime()
      .resized();
    if (prevPhotos) keyboard.text("Оставить текущее");
    await ctx.reply(`✅ Фото добавлено ${photos.length}/3`, {
      reply_markup: keyboard,
    });
  }
};

export const register = async (
  conversation: MyConversation,
  ctx: MyContext
) => {
  const userData = {
    name: await recieveName(ctx, conversation),
    age: await recieveAge(ctx, conversation),
    city: await recieveCity(ctx, conversation),
    bio: await recieveBio(ctx, conversation),
    isFemale: await recieveIsFemale(ctx, conversation),
    photos: await recievePhotos(ctx, conversation),
  };
  const profile = await prisma.user.upsert({
    where: { tgId: ctx.from.id },
    update: userData,
    create: { tgId: ctx.from.id, ...userData },
  });
  await ctx.reply("👤 Ваш профиль обновлен:");
  await sendProfile(ctx, profile);
};
