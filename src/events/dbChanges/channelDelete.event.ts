import { CategoryModel } from "@/schemas/category.js";
import Event from "@/structures/Event.js";

export default new Event({
  event: "channelDelete",
  async run(client, channel) {
    CategoryModel.findOneAndDelete({
      $or: [
        {
          categoryId: channel.id,
        },
        {
          "channels.channelId": channel.id,
        },
      ],
    });
  },
});
