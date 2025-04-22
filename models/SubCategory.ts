import mongoose, { Schema, Document, models } from "mongoose";

const SubcategorySchema = new Schema(
  {
    name: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

const Subcategory =
  models.Subcategory || mongoose.model("Subcategory", SubcategorySchema);

export default Subcategory;
