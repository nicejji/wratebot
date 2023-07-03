(await import("dotenv")).config();
import express from "express";
import { webhookCallback } from "grammy";
import bot from "./bot.js";

const secretPath = process.env.BOT_TOKEN;

const app = express();
app.use(express.json());
app.use(`/${secretPath}`, webhookCallback(bot, "express"));

app.listen(Number(process.env.PORT), async () => {
  await bot.api.setWebhook(`https://${process.env.DOMAIN}/${secretPath}`);
});
