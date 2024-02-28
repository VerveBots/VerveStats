/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CategoryModel } from "@/schemas/category.js";
import Event from "@/structures/Event.js";
import { GuildChannel, PermissionFlagsBits } from "discord.js";
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
        if (!category.membersChannelId) return;
        let membersChannel = client.channels.cache.get(
          category.membersChannelId
        );
        if (!membersChannel) return;
        if (membersChannel.isDMBased()) return;
        const { me } = membersChannel.guild.members;
        if (!me) return;
        if (!membersChannel.isVoiceBased() || !membersChannel.isTextBased())
          return;
        if (
          !hasPerms(membersChannel, [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
          ])
        ) {
          return;
        }
        const name = category.membersNameTemplate.replaceAll(
          "{m}",
          guild.memberCount.toLocaleString("en-US")
        );
        if (name === membersChannel.name) return;
        try {
          await membersChannel.setName(name);
        } catch (err) {
          console.error(err);
        }
      });
    });
  },
});
function hasPerms(channel: GuildChannel, permissions: bigint[]) {
  const { me } = channel.guild.members;
  if (!me) return false;
  return permissions.every((permission) =>
    channel.permissionsFor(me).has(permission)
  );
}
