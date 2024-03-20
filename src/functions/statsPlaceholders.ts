import { Guild, PermissionFlagsBits } from "discord.js";
import replacePlaceholders from "./replacePlaceholders.js";

export default async function replaceStatsPlaceholders(
  text: string,
  guild: Guild
) {
  guild = await guild.client.guilds.fetch({
    guild: guild.id,
    withCounts: true,
    force: true,
  });
  const members = await guild.members.fetch();
  return replacePlaceholders(text, {
    "{mc}": guild.memberCount.toLocaleString("en-US"),
    "{m}": members.filter((v) => !v.user.bot).size.toLocaleString("en-US"),
    "{b}": members.filter((v) => v.user.bot).size.toLocaleString("en-US"),
    "{c}": guild.channels.cache.size.toLocaleString("en-US"),
    "{r}": guild.roles.cache.size.toLocaleString("en-US"),
    "{boosts}": (guild.premiumSubscriptionCount || 0).toLocaleString("en-US"),
    "{o}": guild.presences.cache
      .filter((v) => v.status !== "offline")
      .size.toLocaleString("en-US"),
    "{online}": guild.presences.cache
      .filter((v) => v.status === "online")
      .size.toLocaleString("en-US"),
    "{dnd}": guild.presences.cache
      .filter((v) => v.status === "dnd")
      .size.toLocaleString("en-US"),
    "{idle}": members
      .filter((v) => v.presence?.status === "idle")
      .size.toLocaleString("en-US"),
    "{offline}": (
      guild.memberCount -
      guild.presences.cache.filter((v) => v.status !== "offline").size
    ).toLocaleString("en-US"),
    "{admins}": members
      .filter((v) => v.permissions.has(PermissionFlagsBits.Administrator))
      .size.toLocaleString("en-US"),
    "{managers}": members
      .filter((v) => v.permissions.has(PermissionFlagsBits.ManageGuild))
      .size.toLocaleString("en-US"),
    "{moderators}": members
      .filter((v) => v.permissions.has(PermissionFlagsBits.ManageMessages))
      .size.toLocaleString("en-US"),
  });
}
