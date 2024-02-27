import RoleSelect from "@/structures/Select/Role.js";

export default new RoleSelect({
  customId: "example",
  async run(client, interaction) {
    await interaction.reply("Hello!");
  },
});
