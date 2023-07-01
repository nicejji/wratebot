import bot from "./bot.js";
import { sendProfile } from "./helpers.js";

await bot.api.setMyCommands([
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
  await ctx.reply("👤 Так выглядит ваш профиль:");
  await sendProfile(ctx, ctx.profile);
});
pm.command("search", async (ctx) => {
  await ctx.conversation.enter("search");
});

pm.command("likes", async (ctx) => {
  await ctx.conversation.enter("likes");
});

bot.start();
