import replacePrefixes from "@/functions/replacePrefixes.js";
import { CategoryModel } from "@/schemas/category.js";
import Command from "@/structures/Command.js";
import {
  ChannelType,
  OverwriteType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("serverstats")
    .setDescription("Manage the server stats category")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a server stats channel")
        .addStringOption((string) =>
          string
            .setName("name")
            .setDescription(
              "The name of the channel | {m}: members | {b}: bots | {mc}: {m}+{b}"
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-name")
        .setDescription("Set the template of a specific channel")
        .addStringOption((string) =>
          string
            .setName("channel")
            .setDescription("The channel to update")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((string) =>
          string
            .setName("name")
            .setDescription("The new name of the channel")
            .setRequired(true)
        )
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async run(_client, interaction) {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply({
      ephemeral: true,
    });
    if (!interaction.appPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.editReply(
        "I do not have the `Manage Channels` permission"
      );
    }
    let category = await CategoryModel.findOne({
      guildId: interaction.guildId,
    });
    if (!category) {
      category = new CategoryModel({
        guildId: interaction.guildId,
      });
    }
    const name = interaction.options.getString("name") || "Members: {m}";
    if (category.channels.some((v) => v.template === name)) {
      await interaction.editReply("There is already a channel with that name.");
      return;
    }
    let categoryChannel = interaction.guild.channels.cache.get(
      category.categoryId
    );
    if (!categoryChannel) {
      categoryChannel = await interaction.guild.channels.create({
        type: ChannelType.GuildCategory,
        name: interaction.options.getString("category") || "Server Stats",
        permissionOverwrites: [
          {
            id: interaction.guildId,
            type: OverwriteType.Role,
            deny: ["Connect"],
          },
        ],
        position: 0,
        reason: `${interaction.user.tag} created a ServerStats category`,
      });
      category.categoryId = categoryChannel.id;
    }

    if (categoryChannel.type !== ChannelType.GuildCategory) return;

    const guild = await interaction.client.guilds.fetch({
      guild: interaction.guildId,
      withCounts: true,
      force: true,
    });

    const members = await guild.members.fetch();
    const channel = await categoryChannel.children.create({
      type: ChannelType.GuildVoice,
      name: replacePrefixes(name, {
        "{mc}": guild.memberCount.toLocaleString("en-US"),
        "{m}": members.filter((m) => !m.user.bot).size.toLocaleString("en-US"),
        "{b}": members.filter((m) => m.user.bot).size.toLocaleString("en-US"),
      }),
      reason: `${interaction.user.tag} created a ServerStats channel`,
      permissionOverwrites: [
        {
          id: interaction.client.application.id,
          allow: [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
          ],
        },
        {
          id: interaction.guildId,
          deny: [PermissionFlagsBits.Connect],
        },
      ],
    });
    category.channels.push({
      channelId: channel.id,
      template: name,
    });
    await category.save();
    await interaction.editReply("Done making channels!");
  },
});
