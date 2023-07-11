import express from "express";
import { webhookCallback } from "grammy";
import bot from "./bot.js";
import env from "./env.js";

const secretPath = env.BOT_TOKEN;

const app = express();
app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(env.PORT, async () => {
  await bot.api.setWebhook(`${env.DOMAIN}/${secretPath}`);
});
