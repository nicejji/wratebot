import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { Location } from "grammy/types";
import { Keyboard } from "grammy";
import prisma from "../prisma.js";

type MyConversation = Conversation<MyContext>;

const getCity = async (location: string | Location) => "Polotsk";

export const register = async (
  conversation: MyConversation,
  ctx: MyContext
) => {
  const userInfo = {
    name: "",
    age: 0,
    city: "",
    bio: "",
    isFemale: false,
    photos: [],
  };
  await ctx.reply("Enter your name", {
    reply_markup: new Keyboard().text(ctx.from.first_name ?? "SomeName"),
  });
  while (true) {
    userInfo.name = await conversation.form.text();
    if (userInfo.name.length < 30) break;
    await ctx.reply("This name is too long!");
  }
  await ctx.reply("Enter your age");
  while (true) {
    userInfo.age = await conversation.form.int();
    if (userInfo.age > 15 && userInfo.age < 100) break;
    await ctx.reply("Incorrect age!");
  }
  await ctx.reply("Enter your city", {
    reply_markup: new Keyboard().requestLocation("Send my location"),
  });
  while (true) {
    const coordsCtx = await conversation.waitFor([":location", ":text"]);
    userInfo.city = await getCity(coordsCtx.msg.location ?? coordsCtx.msg.text);
    if (userInfo.city) break;
    await ctx.reply("Incorrect city!");
  }
  await ctx.reply("Write something about you");
  while (true) {
    userInfo.bio = await conversation.form.text();
    if (userInfo.bio.length < 70) break;
    await ctx.reply("Text is too long");
  }
  await ctx.reply("Enter your gender", {
    reply_markup: new Keyboard().text("Male").text("Female"),
  });
  while (true) {
    const gender = await conversation.form.text();
    if (gender === "Male") {
      userInfo.isFemale = false;
      break;
    }
    if (gender === "Female") {
      userInfo.isFemale = true;
      break;
    }
    await ctx.reply("Choose one!");
  }
  await ctx.reply("Send your photos");
  photoLoop: while (true) {
    const photosCtx = await conversation.waitFor(":photo");
    userInfo.photos = [...userInfo.photos, photosCtx.msg.photo[0].file_id];
    await ctx.reply("Wanna add one more photo?", {
      reply_markup: new Keyboard().text("Yes").text("No").oneTime(),
    });
    while (true) {
      const addMore = await conversation.form.text();
      if (addMore === "No") break photoLoop;
      if (addMore === "Yes") {
        await ctx.reply("Send me another photo");
        continue photoLoop;
      }
      await ctx.reply("No such option");
    }
  }
  try {
    await prisma.user.create({
      data: { tgId: ctx.from.id, ...userInfo },
    });
  } catch {
    await prisma.user.update({
      where: {
        tgId: ctx.from.id,
      },
      data: userInfo,
    });
  }
  await ctx.reply("Successful registration!");
};
