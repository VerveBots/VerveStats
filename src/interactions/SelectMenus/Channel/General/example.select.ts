import ChannelSelect from "@/structures/Select/Channel.js";

export default new ChannelSelect({
  customId: "example",
  async run(client, interaction) {
    await interaction.reply("Hello!");
  },
});
