import hasPerms from "@/functions/hasPerms.js";
import replaceStatsPlaceholders from "@/functions/statsPlaceholders.js";
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
              "The name of the channel. Use /placeholders command to view all placeholders."
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
            .setDescription(
              "The new name of the channel. Use /placeholders command to view all placeholders."
            )
            .setRequired(true)
        )
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async run(client, interaction) {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply({
      ephemeral: true,
    });
    if (!interaction.appPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.editReply(
        "I do not have the `Manage Channels` permission"
      );
    }
    switch (interaction.options.getSubcommand()) {
      case "create": {
        let category = await CategoryModel.findOne({
          guildId: interaction.guildId,
        });
        if (!category) {
          category = new CategoryModel({
            guildId: interaction.guildId,
          });
        }
        const name = interaction.options.getString("name") || "Members: {mc}";
        if (category.channels.some((v) => v.template === name)) {
          await interaction.editReply(
            "There is already a channel with that name."
          );
          return;
        }
        let categoryChannel = interaction.guild.channels.cache.get(
          category.categoryId
        );
        const messages = {
          "Creating channel...": "🔁",
          "Saving to database...": "🔁",
        };
        if (!categoryChannel) {
          Object.assign({ "Creating category...": "🔁" }, messages);

          await interaction.editReply(
            Object.keys(messages)
              .map((v) => `${v} ${messages[v as keyof typeof messages]}`)
              .join("\n")
          );
          categoryChannel = await interaction.guild.channels
            .create({
              type: ChannelType.GuildCategory,
              name: interaction.options.getString("category") || "Server Stats",
              permissionOverwrites: [
                {
                  id: interaction.guildId,
                  type: OverwriteType.Role,
                  deny: [PermissionFlagsBits.Connect],
                },
                {
                  id: interaction.client.application.id,
                  type: OverwriteType.Member,
                  allow: [
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.Connect,
                  ],
                },
              ],
              position: 0,
              reason: `${interaction.user.tag} created a ServerStats category`,
            })
            .catch((error) => {
              console.error(error);
              client.logger.error(error);
              return undefined;
            });
        }
        if (!categoryChannel) {
          await interaction.editReply("An error occured.");
          return;
        }
        if (categoryChannel.type !== ChannelType.GuildCategory) {
          await interaction.editReply(
            "An error occured. Category channel is not of type category channel. I know it's confusing, but contact DiscoVote developers."
          );
          return;
        }
        category.categoryId = categoryChannel.id;
        if ("Creating category..." in messages)
          messages["Creating category..."] = "✅";
        await interaction.editReply(
          Object.keys(messages)
            .map((v) => `${v} ${messages[v as keyof typeof messages]}`)
            .join("\n")
        );

        const channel = await categoryChannel.children
          .create({
            type: ChannelType.GuildVoice,
            name: await replaceStatsPlaceholders(name, interaction.guild),
            reason: `${interaction.user.tag} created a ServerStats channel`,
            permissionOverwrites: [
              {
                id: interaction.client.application.id,
                allow: [
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.Connect,
                  PermissionFlagsBits.ViewChannel,
                ],
              },
              {
                id: interaction.guildId,
                deny: [PermissionFlagsBits.Connect],
              },
            ],
          })
          .catch((error) => {
            console.error(error);
            client.logger.error(error);
          });
        if (!channel) return;
        category.channels.push({
          channelId: channel.id,
          template: name,
        });
        messages["Creating channel..."] = "✅";
        await interaction.editReply(
          Object.keys(messages)
            .map((v) => `${v} ${messages[v as keyof typeof messages]}`)
            .join("\n")
        );
        await category.save();
        messages["Saving to database..."] = "✅";
        await interaction.editReply(
          Object.keys(messages)
            .map((v) => `${v} ${messages[v as keyof typeof messages]}`)
            .join("\n") + "\nAll done!"
        );
        return;
      }
      case "set-name": {
        const channel = interaction.options.getString("channel", true);
        const name = interaction.options.getString("name", true);
        const category = await CategoryModel.findOne({
          guildId: interaction.guildId,
        });
        if (!category) {
          return await interaction.editReply("You have no channels created.");
        }
        if (channel === name) {
          return await interaction.editReply("Done");
        }
        const found = category.channels.find((v) => v.template === channel);
        if (category?.channels.every((v) => v.template !== channel) || !found) {
          return await interaction.editReply("Invalid channel");
        }
        found.template = name;
        await category.save();
        await interaction.editReply("Done");
        const ch = interaction.guild.channels.cache.get(found.channelId);
        if (!ch || (!ch.isTextBased() && !ch.isVoiceBased()) || ch.isThread())
          return await interaction.editReply("Invalid channel");
        if (
          !hasPerms(ch, [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
          ])
        ) {
          return await interaction.editReply(
            "Need `Manage Channels` and `Connect` permissions in that channel"
          );
        }
        try {
          await ch.setName(
            await replaceStatsPlaceholders(name, interaction.guild)
          );
          await interaction.editReply("Done");
        } catch (error) {
          client.logger.error(error);
          console.error(error);
        }
        return;
      }
    }
  },
  async autocomplete(client, interaction) {
    const category = await CategoryModel.findOne({
      guildId: interaction.guildId,
    });
    if (!category) return await interaction.respond([]);
    return await interaction.respond(
      category.channels.map((ch, i) => ({
        name: `${i + 1}. ${ch.template}`,
        value: ch.template,
      }))
    );
  },
});
