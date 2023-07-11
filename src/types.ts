import {
  Conversation as BaseConversation,
  ConversationFlavor,
} from "@grammyjs/conversations";
import { User } from "@prisma/client";
import { Context as BaseContext } from "grammy";

export type Context = BaseContext &
  ConversationFlavor & {
    profile: User | null;
  };

export type Conversation = BaseConversation<Context>;
