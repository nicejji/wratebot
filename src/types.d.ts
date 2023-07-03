import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { User } from "@prisma/client";
import { Context } from "grammy";

export type Context = Context &
  ConversationFlavor & {
    profile: User | null;
  };

export type Conversation = Conversation<Context>;
