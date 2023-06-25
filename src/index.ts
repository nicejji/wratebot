import bot from "./bot.js";
import prisma from "./prisma.js";

const pm = bot.chatType("private");

pm.command("register", (ctx) => ctx.conversation.enter("register"));
pm.command("profile", async (ctx) => {
  const user = await prisma.user.findUnique({ where: { tgId: ctx.from.id } });
  if (!user) {
    await ctx.reply("You are not registered!");
    return;
  }
  await ctx.replyWithMediaGroup(
    user.photos.map((id, index) => ({
      media: id,
      type: "photo",
      caption:
        index !== 0
          ? ""
          : `
${user.name}, ${user.age} - ${user.city}
${user.bio}
`,
    }))
  );
});

bot.start();
