import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

import {
  uploadFileToCloudinary,
  uploadMultipleFilesToCloudinary,
} from "@/lib/upload";
import { parseForm } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Replace category object with just the name
    const formattedProducts = products.map((product) => ({
      ...product,
      category: product.category?.name || null,
    }));

    return sendSuccessResponse(
      200,
      "Products fetched successfully!",
      formattedProducts
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { fields, files } = await parseForm(req);

    // 1. Find category
    const categoryName = fields.categoryName?.[0] || fields.categoryName;
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return sendErrorResponse(404, "Category not found");
    }

    // 2. Upload media files
    const galleryImages = await uploadMultipleFilesToCloudinary(
      Array.isArray(files.galleryImages)
        ? files.galleryImages
        : [files.galleryImages],
      "products/gallery"
    );
    const featuredImage = await uploadFileToCloudinary(
      files.featuredImage?.[0] || files.featuredImage,
      "products/featured"
    );
    const video = await uploadFileToCloudinary(
      files.video?.[0] || files.video,
      "products/videos"
    );
    const docs = await uploadMultipleFilesToCloudinary(
      Array.isArray(files.docs) ? files.docs : [files.docs],
      "products/docs"
    );

    // 3. Create product
    const newProduct = new Product({
      title: fields.title?.[0] || fields.title,
      tagline: fields.tagline?.[0] || fields.tagline,
      description: fields.description?.[0] || fields.description,
      category: category._id,
      status: fields.status?.[0] || fields.status,
      currentValue: fields.currentValue?.[0] || fields.currentValue,
      expectedValue: fields.expectedValue?.[0] || fields.expectedValue,
      projectedReturn: fields.projectedReturn?.[0] || fields.projectedReturn,
      minInvestment: fields.minInvestment?.[0] || fields.minInvestment,
      subscriptionFee: fields.subscriptionFee?.[0] || fields.subscriptionFee,
      managementFee: fields.managementFee?.[0] || fields.managementFee,
      performanceFee: fields.performanceFee?.[0] || fields.performanceFee,
      activationDate: fields.activationDate?.[0] || fields.activationDate,
      expirationDate: fields.expirationDate?.[0] || fields.expirationDate,
      commitmentDeadline:
        fields.commitmentDeadline?.[0] || fields.commitmentDeadline,
      investmentDuration:
        fields.investmentDuration?.[0] || fields.investmentDuration,
      state: fields.state?.[0] || fields.state,
      area: fields.area?.[0] || fields.area,
      galleryImages,
      featuredImage,
      video,
      docs,
    });

    await newProduct.save();

    // Prepare response
    const productObject = newProduct.toObject();
    productObject.category = categoryName;

    return sendSuccessResponse(
      201,
      "Product added successfully!",
      productObject
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
