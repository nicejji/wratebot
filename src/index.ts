import bot from "./bot.js";
import { sendLikes, sendProfile } from "./helpers.js";

await bot.api.setMyCommands([
  { command: "search", description: "🔎 Оценивать пользователей" },
  { command: "likes", description: "❤️ Полученные оценки" },
  { command: "profile", description: "👤 Мой профиль" },
  { command: "edit", description: "✏️ Заполнить профиль снова" },
]);

const pm = bot.chatType("private");

pm.command("start", async (ctx) => {
  if (ctx.profile) {
    ctx.reply("Добро пожаловать снова!");
  } else {
    ctx.reply("Давайте создадим ваш профиль");
    await ctx.conversation.enter("register");
  }
});

pm.command("edit", async (ctx) => {
  await ctx.conversation.enter("register");
});
pm.command("profile", async (ctx) => {
  await ctx.reply("👤 Так выглядит ваш профиль:");
  await sendProfile(ctx, ctx.profile);
});
pm.command("search", async (ctx) => {
  await ctx.conversation.enter("search");
});

pm.command("likes", async (ctx) => {
  await sendLikes(ctx);
});

bot.start();
