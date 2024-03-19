import Command from "@/structures/Command.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import availablePlaceholders from "@/../cfg/available_placeholders.json" assert { type: "json" };
export default new Command({
  data: new SlashCommandBuilder()
    .setName("placeholders")
    .setDescription("View all currently available placeholders"),
  async run(client, interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`All Placeholders`)
          .setDescription(
            `Total placeholders - ${availablePlaceholders.length}\n\n${availablePlaceholders.map(v => `**${v.name}** - ${v.description}`)}`
          ),
      ],
    });
  },
});
