/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CategoryModel } from "@/schemas/category.js";
import Event from "@/structures/Event.js";
import { ChannelType } from "discord.js";
import cron from "node-cron";

export default new Event({
  event: "ready",
  run: async (client) => {
    client.logger.log({
      level: "info",
      message: `Bot logged in as ${client.user?.tag}`,
    });
    const commands = client.commands.map((command) => command.data.toJSON());
    const contextMenus = client.contextMenus.map((command) =>
      command.data.toJSON()
    );
    if (client.config.COMMANDS_GUILD_ONLY === "true")
      await client.guilds.cache
        .get(client.config.GUILD_ID)
        ?.commands.set([...commands, ...contextMenus]);
    else await client.application?.commands.set([...commands, ...contextMenus]);

    cron.schedule("*/5 * * * *", async () => {
      const categories = await CategoryModel.find();
      categories.forEach(async (category) => {
        const guild = await client.guilds.fetch({
          guild: category.guildId,
          withCounts: true,
          force: true,
        });
        const channel = guild.channels.cache.get(category.categoryId);
        if (channel?.type !== ChannelType.GuildCategory) {
          await CategoryModel.findOneAndDelete({
            categoryId: category.categoryId,
          });
          return;
        }
        if (!category.membersChannelId) return;
        const membersChannel = channel.children.cache.get(
          category.membersChannelId
        );
        await membersChannel?.setName(
          category.membersNameTemplate.replaceAll(
            "{m}",
            guild.memberCount.toLocaleString("en-US")
          )
        );
      });
    });
  },
});
