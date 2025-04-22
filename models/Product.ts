import mongoose, { Schema, Document, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String },
    tagline: { type: String },
    description: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    currentValue: {
      type: Number,
    },
    expectedValue: {
      type: Number,
    },
    projectedReturn: {
      type: Number,
    },
    minInvestment: {
      type: Number,
    },
    subscriptionFee: {
      type: Number,
    },
    managementFee: {
      type: Number,
    },
    performanceFee: {
      type: Number,
    },
    activationDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
    },
    commitmentDeadline: {
      type: Date,
    },
    investmentDuration: {
      type: Number,
    },
    state: {
      type: String,
    },
    area: {
      type: String,
    },

    // ✅ Media fields
    galleryImages: [{ type: String }], // multiple image URLs
    featuredImage: { type: String }, // main image URL
    video: { type: String }, // video URL or path
    docs: [{ type: String }], // document URLs or file paths
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", ProductSchema);

export default Product;
