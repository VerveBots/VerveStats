import StringSelect from "@/structures/Select/String.js";

export default new StringSelect({
  customId: "example",
  async run(client, interaction) {
    await interaction.reply("Hello!");
  },
});
