import mongoose, { Schema, Document, models } from "mongoose";

const MalcoAssetSchema = new Schema(
  {
    assetName: { type: String },
    longName: { type: String },
    category: {
      type: String,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: String,
      ref: "SubCategory",
      required: true,
    },
    isin: { type: String },
    pandaId: { type: Number },
  },
  { timestamps: true }
);

const MalcoAsset =
  models.MalcoAsset || mongoose.model("MalcoAsset", MalcoAssetSchema);

export default MalcoAsset;
