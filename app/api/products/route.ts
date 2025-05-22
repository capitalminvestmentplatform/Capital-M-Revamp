import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

import {
  uploadFileToCloudinary,
  uploadMultipleFilesToCloudinary,
} from "@/lib/upload";
import {
  loggedIn,
  parseForm,
  processTiptapImages,
  sendNotification,
} from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { newInvestmentEmail } from "@/templates/emails";
import User from "@/models/User";

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
    const decoded: any = await loggedIn();

    const { fields, files } = await parseForm(req);

    const isDraft = fields.isDraft?.[0] === "true";
    const status = isDraft ? false : fields.status?.[0] === "true";

    const cleanField = (field: any) => {
      if (Array.isArray(field)) {
        const value = field[0];
        return value === "" ? undefined : value;
      }
      return field === "" ? undefined : field;
    };

    // 1. Find category
    const categoryName = cleanField(fields.category);
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return sendErrorResponse(404, "Category not found");
    }

    const rawDescription = cleanField(fields.description);

    let cleanedDescription = rawDescription;
    if (typeof rawDescription === "string") {
      cleanedDescription = await processTiptapImages(rawDescription);
    }

    const featuredImage = await uploadFileToCloudinary(
      files.featuredImage?.[0] || files.featuredImage,
      "products/featured"
    );

    // 2. Upload media files

    // ✅ Gallery Images
    let galleryImages: string[] = [];
    if (files.galleryImages) {
      const gallery = Array.isArray(files.galleryImages)
        ? files.galleryImages
        : [files.galleryImages];

      const hasValidGallery = gallery.some(
        (file: any) => file && file.filepath && file.originalFilename
      );

      if (hasValidGallery) {
        galleryImages = await uploadMultipleFilesToCloudinary(
          gallery,
          "products/gallery"
        );
      }
    }

    // ✅ Video
    let video: string | null = null;
    const rawVideo = files.video?.[0] || files.video;
    if (rawVideo?.filepath && rawVideo.originalFilename) {
      video = await uploadFileToCloudinary(rawVideo, "products/videos");
    }

    // ✅ Docs
    let docs: string[] = [];
    if (files.docs) {
      const docList = Array.isArray(files.docs) ? files.docs : [files.docs];

      const hasValidDocs = docList.some(
        (file: any) => file && file.filepath && file.originalFilename
      );

      if (hasValidDocs) {
        docs = await uploadMultipleFilesToCloudinary(docList, "products/docs");
      }
    }

    // ✅ Clean FAQs
    const faqsRaw = fields.faqs
      ? JSON.parse(fields.faqs[0] || fields.faqs)
      : [];
    const faqs = Array.isArray(faqsRaw)
      ? faqsRaw.filter((faq) => faq.question?.trim() || faq.answer?.trim())
      : [];

    // Generate productId
    const categoryPrefix = categoryName.slice(0, 2).toUpperCase();
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // e.g. "25"
    const month = String(now.getMonth() + 1).padStart(2, "0"); // e.g. "04"
    const productCount = await Product.countDocuments({});
    const rawCount = productCount + 1;

    const paddedCount =
      rawCount < 10
        ? `000${rawCount}`
        : rawCount < 100
          ? `00${rawCount}`
          : rawCount < 1000
            ? `0${rawCount}`
            : `${rawCount}`;

    const productId = `${categoryPrefix}${year}${month}${paddedCount}`;

    // 3. Create product
    const newProduct = new Product({
      productId,
      title: cleanField(fields.title),
      tagline: cleanField(fields.tagline),
      description: cleanedDescription,
      category: category._id,
      isDraft,
      isPublished: isDraft ? false : true,
      status,
      currentValue: cleanField(fields.currentValue),
      expectedValue: cleanField(fields.expectedValue),
      projectedReturn: cleanField(fields.projectedReturn),
      minInvestment: cleanField(fields.minInvestment),
      subscriptionFee: cleanField(fields.subscriptionFee),
      managementFee: cleanField(fields.managementFee),
      performanceFee: cleanField(fields.performanceFee),
      activationDate: cleanField(fields.activationDate),
      expirationDate: cleanField(fields.expirationDate),
      commitmentDeadline: cleanField(fields.commitmentDeadline),
      investmentDuration: cleanField(fields.investmentDuration),
      state: cleanField(fields.state),
      area: cleanField(fields.area),
      terms: cleanField(fields.terms),
      galleryImages,
      featuredImage,
      video,
      docs,
      faqs,
    });

    await newProduct.save();

    const productObject = newProduct.toObject();
    productObject.category = categoryName;

    const users = await User.find({
      email: { $ne: decoded.email },
    });

    if (!isDraft) {
      for (const user of users) {
        const notify = {
          title: "New Investment Opportunity",
          message: `New investment ${productObject.title} has launched in the system. Check it out.`,
          type: "info",
        };
        await sendNotification(user.email, notify);

        setTimeout(() => {
          (globalThis as any).io?.emit("new-notification", {
            ...notify,
            timestamp: new Date(),
          });
        }, 1000);

        const { firstName, lastName, email } = user;
        const { title, projectedReturn, investmentDuration } = productObject;
        const investmentId = productObject._id;

        await newInvestmentEmail(
          {
            firstName,
            lastName,
            email,
            title,
            projectedReturn,
            investmentDuration,
            investmentId,
          },
          "New Investment Opportunity - Capital M"
        );
      }
    }

    return sendSuccessResponse(
      201,
      "Product added successfully!",
      productObject
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
