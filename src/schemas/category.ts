import { Schema, model } from "mongoose";
interface ICategoryModel {
  guildId: string;
  categoryId: string;
  membersChannelId?: string;
  membersNameTemplate: string;
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
  membersChannelId: {
    required: false,
    type: String,
  },
  membersNameTemplate: {
    required: false,
    type: String,
    default: "Members: {m}",
  },
});
export const CategoryModel = model<ICategoryModel>("categories", schema);
