import { Context, SessionFlavor } from "grammy";
import { ConversationFlavor } from "@grammyjs/conversations";

export type SessionData = {
  pizzaCount: number;
};

export type MyContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor;
