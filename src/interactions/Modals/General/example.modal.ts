import Modal from "@/structures/Modal.js";

export default new Modal({
  customId: "example",
  async run(client, interaction) {
    await interaction.reply("Hello!");
  },
});
