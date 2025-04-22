import mongoose, { Schema, models } from "mongoose";

const PandaConnectSchema = new Schema(
  {
    category: { type: String },
    subCategory: { type: String },
    userAsset: { type: String },
    costPrice: { type: Number },
    marketValue: { type: Number },
    initialCost: { type: Number },
    email: { type: String },
    clientCode: { type: String },
  },
  { timestamps: true }
);

const PandaConnect =
  models.PandaConnect || mongoose.model("PandaConnect", PandaConnectSchema);

export default PandaConnect;
