import { CategoryModel } from "@/schemas/category.js";
import Event from "@/structures/Event.js";

export default new Event({
  event: "guildDelete",
  async run(_client, guild) {
    await CategoryModel.deleteMany({
      guildId: guild.id,
    });
  },
});
