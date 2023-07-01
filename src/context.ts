import { ConversationFlavor } from "@grammyjs/conversations";
import { User } from "@prisma/client";
import { Context } from "grammy";

export type MyContext = Context &
  ConversationFlavor & {
    profile: null | User;
  };
