// import { webhookCallback } from "grammy";
import bot from "./bot.js";
import { sendProfile } from "./helpers.js";
// import express from "express";

bot.api.setMyCommands([
  { command: "search", description: "🔎 Поиск пользователей" },
  { command: "likes", description: "❤️ Полученные лайки" },
  { command: "profile", description: "👤 Мой профиль" },
  { command: "edit", description: "✏️ Редактировать профиль" },
]);

const pm = bot.chatType("private");

pm.command("start", async (ctx) => {
  if (ctx.profile) {
    ctx.reply("Добро пожаловать снова! 😉");
  } else {
    ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
  }
});

pm.command("edit", async (ctx) => {
  await ctx.conversation.enter("register");
});
pm.command("profile", async (ctx) => {
  if (!ctx.profile) {
    ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
    return;
  }
  await ctx.reply("👤 Так выглядит ваш профиль:");
  await sendProfile(ctx, ctx.profile);
});
pm.command("search", async (ctx) => {
  if (!ctx.profile) {
    ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
    return;
  }
  await ctx.conversation.enter("search");
});

pm.command("likes", async (ctx) => {
  if (!ctx.profile) {
    ctx.reply("Давайте создадим ваш профиль 📝");
    await ctx.conversation.enter("register");
    return;
  }
  await ctx.conversation.enter("likes");
});

bot.api.deleteWebhook();
bot.start();

// const app = express();
// app.use(express.json());
// app.use(`/${process.env.BOT_TOKEN}`, webhookCallback(bot, "express"));
// app.listen(Number(process.env.WEBHOOK_PORT), async () => {
// console.log(
// `Bot webhook listening on ${process.env.WEBHOOK_URL}:${process.env.WEBHOOK_PORT}`
// );
// await bot.api.setWebhook(
// `https://${process.env.WEBHOOK_URL}/${process.env.BOT_TOKEN}`
// );
// const webHookInfo = await bot.api.getWebhookInfo();
// console.log(webHookInfo);
// });
