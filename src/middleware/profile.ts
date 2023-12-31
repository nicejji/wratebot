import { NextFunction } from "grammy";
import prisma from "../prisma.js";
import { Context } from "../types.js";

export const profileMiddleware = async (ctx: Context, next: NextFunction) => {
  ctx.profile = ctx?.from?.id
    ? await prisma.user.findUnique({ where: { tgId: ctx.from.id } })
    : null;
  await next();
};
