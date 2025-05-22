import mongoose, { Schema, Document, models } from "mongoose";

const ProductSchema = new Schema(
  {
    productId: {
      type: String,
    },
    title: { type: String },
    tagline: { type: String },
    description: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
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
    isDraft: {
      type: Boolean,
      default: false,
    },

    // ✅ Media fields
    galleryImages: [{ type: String }], // multiple image URLs
    featuredImage: { type: String }, // main image URL
    video: { type: String }, // video URL or path
    docs: [{ type: String }], // document URLs or file paths
    terms: { type: String }, // terms and conditions URL or path
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  },

  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", ProductSchema);

export default Product;
