import { User } from "@prisma/client";
import { Context } from "./types.js";

export const escapeMarkdown = (text: string) => {
  return [...text].map((s) => `\\${s}`).join("");
};

export const sendProfile = async (
  ctx: Context,
  profile: User,
  toId?: number
) => {
  const text = `${profile.name}, ${profile.age} - ${profile.city}\n${profile.bio}`;
  await ctx.api.sendMediaGroup(
    toId ?? ctx.from.id,
    profile.photos.map((id, i) => ({
      media: id,
      type: "photo",
      caption: i === 0 ? text : "",
    }))
  );
};
