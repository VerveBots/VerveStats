import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import ContextMenu from "@/structures/ContextMenu.js";

export default new ContextMenu({
  data: new ContextMenuCommandBuilder()
    .setName("example")
    .setType(ApplicationCommandType.User),
  async run(client, interaction) {
    await interaction.reply("Hey");
  },
});
