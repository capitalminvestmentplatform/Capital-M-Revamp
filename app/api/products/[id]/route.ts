import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

// Accepts productId from the route like: /api/products/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const productId = params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }
    return sendSuccessResponse(200, "product fetched successfully", product);
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

    const product = await Product.findById(productId);

    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }

    await Product.findByIdAndDelete(productId);

    return sendSuccessResponse(200, "product deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
