import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../context.js";
import { Location } from "grammy/types";
import { Keyboard } from "grammy";
import prisma from "../prisma.js";

type MyConversation = Conversation<MyContext>;

// WARNING: Incorrect api parsing for getting city
const getCity = async (location: string | Location): Promise<string | null> => {
  const url = "https://geocode-maps.yandex.ru/1.x/?";
  const params = new URLSearchParams({
    apikey: process.env.MAPS_API_KEY,
    format: "json",
    geocode:
      typeof location === "string"
        ? location
        : `${location.longitude},${location.latitude}`,
  });
  try {
    const data = await (await fetch(url + params)).json();
    const city =
      data?.response?.GeoObjectCollection?.featureMember?.[3]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
        (v: { name: string; kind: string }) => v.kind === "locality"
      )?.name;
    console.log(
      data?.response?.GeoObjectCollection?.featureMember?.[3]?.GeoObject
        ?.metaDataProperty?.GeocoderMetaData?.Address?.Components
    );
    return city || null;
  } catch {
    return null;
  }
};

export const register = async (
  conversation: MyConversation,
  ctx: MyContext
) => {
  let name: string;
  let age: number;
  let city: string;
  let bio: string;
  let isFemale: boolean;
  let photos: string[] = [];
  await ctx.reply("Enter your name", {
    reply_markup: new Keyboard()
      .text(ctx.from.first_name ?? "SomeName")
      .resized(),
  });
  while (true) {
    name = await conversation.form.text();
    if (name.length < 30) break;
    await ctx.reply("This name is too long!");
  }
  await ctx.reply("Enter your age", {
    reply_markup: { remove_keyboard: true },
  });
  while (true) {
    age = await conversation.form.int();
    if (age > 15 && age < 100) break;
    await ctx.reply("Incorrect age!");
  }
  await ctx.reply("Enter your city", {
    reply_markup: new Keyboard().requestLocation("Send my location").resized(),
  });
  while (true) {
    const coordsCtx = await conversation.waitFor([":location", ":text"]);
    city = await getCity(coordsCtx.msg.location ?? coordsCtx.msg.text);
    if (city) break;
    await ctx.reply("Incorrect city!");
  }
  await ctx.reply("Write something about you", {
    reply_markup: { remove_keyboard: true },
  });
  while (true) {
    bio = await conversation.form.text();
    if (bio.length < 70) break;
    await ctx.reply("Text is too long");
  }
  await ctx.reply("Enter your gender", {
    reply_markup: new Keyboard().text("Male").text("Female").resized(),
  });
  while (true) {
    const gender = await conversation.form.text();
    if (gender === "Male" || gender === "Female") {
      isFemale = gender === "Female";
      break;
    }
    await ctx.reply("Choose one!");
  }
  await ctx.reply("Send your photos", {
    reply_markup: { remove_keyboard: true },
  });
  photoLoop: while (true) {
    const photosCtx = await conversation.waitFor(":photo");
    photos = [...photos, photosCtx.msg.photo[0].file_id];
    await ctx.reply("Wanna add one more photo?", {
      reply_markup: new Keyboard().text("Yes").text("No").oneTime().resized(),
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
      data: { tgId: ctx.from.id, name, age, bio, city, photos, isFemale },
    });
  } catch {
    await prisma.user.update({
      where: {
        tgId: ctx.from.id,
      },
      data: { name, age, bio, city, photos, isFemale },
    });
  }
  await ctx.reply("Successful registration!");
};
