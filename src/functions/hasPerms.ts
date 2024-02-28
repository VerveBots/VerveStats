import { GuildChannel } from "discord.js";

export default function hasPerms(channel: GuildChannel, permissions: bigint[]) {
  const { me } = channel.guild.members;
  if (!me) return false;
  return permissions.every((permission) =>
    channel.permissionsFor(me).has(permission)
  );
}
