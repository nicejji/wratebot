import { User } from "@prisma/client";
import { MyContext } from "./context.js";

export const sendProfile = async (
  ctx: MyContext,
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
