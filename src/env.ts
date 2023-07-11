import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const digitsRegex = /^\d+$/;

const schema = z.object({
  BOT_TOKEN: z.string(),
  DATABASE_URL: z.string().url(),
  DOMAIN: z.string().url(),
  PORT: z.string().regex(digitsRegex).transform(Number),
});

const env = schema.parse(process.env);

export default env;
