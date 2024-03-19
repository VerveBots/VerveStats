/* eslint-disable @typescript-eslint/no-non-null-assertion */
import hasPerms from "@/functions/hasPerms.js";
import replaceStatsPlaceholders from "@/functions/statsPlaceholders.js";
import { CategoryModel } from "@/schemas/category.js";
import Event from "@/structures/Event.js";
import { ActivityType, PermissionFlagsBits } from "discord.js";
import cron from "node-cron";

export default new Event({
  event: "ready",
  run: async (c, client) => {
    c.logger.log({
      level: "info",
      message: `Bot logged in as ${c.user?.tag}`,
    });
    function setStatus() {
      client.user.setPresence({
        activities: [
          {
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size} servers`,
            state: `${client.guilds.cache.size} servers`,
          },
        ],
      });
    }
    setStatus();
    setInterval(setStatus, 60000);
    const commands = c.commands.map((command) => command.data.toJSON());
    // const contextMenus = client.contextMenus.map((command) =>
    //   command.data.toJSON()
    // );
    if (c.config.COMMANDS_GUILD_ONLY === "true")
      await c.guilds.cache.get(c.config.GUILD_ID)?.commands.set([...commands]);
    else await c.application?.commands.set([...commands]);

    cron.schedule("*/5 * * * *", async () => {
      const categories = await CategoryModel.find();
      categories.forEach(async (category) => {
        const guild = c.guilds.cache.get(category.guildId);
        if (!guild) return;
        category.channels.forEach(async (ch, i) => {
          const channel = guild.channels.cache.get(ch.channelId);
          if (!channel) {
            category.channels.splice(i, 1);
            await category.save();
            return;
          }
          if (
            (!channel.isVoiceBased() && !channel.isTextBased()) ||
            channel.isThread()
          ) {
            category.channels.splice(i, 1);
            await category.save();
            return;
          }
          if (
            !hasPerms(channel, [
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.Connect,
            ])
          )
            return;

          const name = await replaceStatsPlaceholders(ch.template, guild);
          if (name === channel.name) return;

          try {
            await channel.setName(name);
          } catch (err) {
            console.error(err);
          }
        });
      });
    });
  },
});
