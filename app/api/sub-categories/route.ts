import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Subcategory from "@/models/SubCategory";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let subCategories: any = [];
    if (category) {
      subCategories = await Subcategory.find({ category })
        .sort({ name: 1 })
        .lean();
    } else {
      subCategories = await Subcategory.find().sort({ name: 1 }).lean();
    }

    return NextResponse.json(subCategories, { status: 200 });
  } catch (error) {
    console.error("Error fetching subCategories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
