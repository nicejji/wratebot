import { NextFunction } from "grammy";
import { MyContext } from "../context.js";
import prisma from "../prisma.js";

export const profileMiddleware = async (ctx: MyContext, next: NextFunction) => {
  ctx.profile = await prisma.user.findUnique({ where: { tgId: ctx.from.id } });
  await next();
};
