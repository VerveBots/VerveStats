import { Schema, model } from "mongoose";
interface ICategoryModel {
  guildId: string;
  categoryId: string;
  channels: Channels[];
}
interface Channels {
  template: string;
  channelId: string;
}
const schema = new Schema<ICategoryModel>({
  guildId: {
    required: true,
    type: String,
  },
  categoryId: {
    required: true,
    type: String,
  },
  channels: {
    type: [
      {
        template: String,
        channelId: String,
      },
    ],
    default: [],
  },
});
export const CategoryModel = model<ICategoryModel>("categories", schema);
