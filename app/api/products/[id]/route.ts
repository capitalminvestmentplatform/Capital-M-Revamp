import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

import {
  uploadFileToCloudinary,
  uploadMultipleFilesToCloudinary,
} from "@/lib/upload";
import { parseForm, processTiptapImages } from "@/utils/server";
import { NextRequest } from "next/server";
import Category from "@/models/Category";

// Accepts productId from the route like: /api/products/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const productId = params.id;

    const product = await Product.findById(productId)
      .populate("category", "name")
      .lean(); // Important to get plain object

    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }

    // 👇 Replace category object with just the name
    const formattedProduct = {
      ...product,
      category: (product as any).category?.name || null,
    };

    return sendSuccessResponse(
      200,
      "Product fetched successfully",
      formattedProduct
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const productId = params.id;

    const updated = await Product.findByIdAndUpdate(
      productId,
      { status: false },
      { new: true }
    );

    if (!updated) {
      return sendErrorResponse(404, "Product not found");
    }

    return sendSuccessResponse(200, "product deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const {
      fields,
      files,
    }: {
      fields: Record<string, string[] | string>;
      files: Record<string, any>;
    } = await parseForm(req);
    const productId = params.id;

    let product = await Product.findById(productId);
    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }

    product = product.toObject(); // Convert to plain object

    // Upload media if new files are sent
    const updatedData: any = {
      ...Object.fromEntries(
        Object.entries(fields).map(([key, val]) => [
          key,
          Array.isArray(val) ? val[0] : val,
        ])
      ),
    };

    // ✅ Convert category name to ObjectId
    if (updatedData.category) {
      const foundCategory = await Category.findOne({
        name: updatedData.category,
      });
      if (!foundCategory) {
        return sendErrorResponse(404, "Category not found");
      }
      updatedData.category = foundCategory._id;
    }

    // ✅ Clean base64 images in description
    if (updatedData.description) {
      updatedData.description = await processTiptapImages(
        updatedData.description
      );
    }

    if (files.featuredImage) {
      updatedData.featuredImage = await uploadFileToCloudinary(
        files.featuredImage[0],
        "products/featured"
      );
    }

    if (files.video) {
      updatedData.video = await uploadFileToCloudinary(
        files.video[0],
        "products/videos"
      );
    }

    if (files.galleryImages) {
      const gallery = Array.isArray(files.galleryImages)
        ? files.galleryImages
        : [files.galleryImages];
      const uploadedGalleryImages = await uploadMultipleFilesToCloudinary(
        gallery,
        "products/gallery"
      );
      updatedData.galleryImages = [
        ...product.galleryImages,
        ...uploadedGalleryImages,
      ];
    }

    if (files.docs) {
      const docs = Array.isArray(files.docs) ? files.docs : [files.docs];
      const uploadedDocs = await uploadMultipleFilesToCloudinary(
        docs,
        "products/docs"
      );

      updatedData.docs = [...product.docs, ...uploadedDocs];
    }
    const faqs = fields.faqs
      ? JSON.parse(Array.isArray(fields.faqs) ? fields.faqs[0] : fields.faqs)
      : [];

    updatedData.faqs = faqs;

    await Product.findByIdAndUpdate(productId, updatedData, { new: true });

    return sendSuccessResponse(200, "Product updated successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
