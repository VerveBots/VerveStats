/* eslint-disable @typescript-eslint/no-non-null-assertion */
import hasPerms from "@/functions/hasPerms.js";
import replacePrefixes from "@/functions/replacePrefixes.js";
import { CategoryModel } from "@/schemas/category.js";
import Event from "@/structures/Event.js";
import { PermissionFlagsBits } from "discord.js";
import cron from "node-cron";

export default new Event({
  event: "ready",
  run: async (client) => {
    client.logger.log({
      level: "info",
      message: `Bot logged in as ${client.user?.tag}`,
    });
    const commands = client.commands.map((command) => command.data.toJSON());
    // const contextMenus = client.contextMenus.map((command) =>
    //   command.data.toJSON()
    // );
    if (client.config.COMMANDS_GUILD_ONLY === "true")
      await client.guilds.cache
        .get(client.config.GUILD_ID)
        ?.commands.set([...commands]);
    else await client.application?.commands.set([...commands]);

    cron.schedule("*/5 * * * *", async () => {
      const categories = await CategoryModel.find();
      categories.forEach(async (category) => {
        const guild = await client.guilds.fetch({
          guild: category.guildId,
          withCounts: true,
          force: true,
        });
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

          const members = await guild.members.fetch();

          const name = replacePrefixes(ch.template, {
            "{mc}": guild.memberCount.toLocaleString("en-US"),
            "{m}": members
              .filter((m) => !m.user.bot)
              .size.toLocaleString("en-US"),
            "{b}": members
              .filter((m) => m.user.bot)
              .size.toLocaleString("en-US"),
          });
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
