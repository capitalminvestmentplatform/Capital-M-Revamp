import * as z from "zod";

export const investmentSchema = (isEditMode: boolean) =>
  z.object({
    title: z.string().min(1, "Title is required"),
    tagline: z.string().optional(),
    // .min(1, "Tagline is required"),
    description: z.string().optional(),
    // .min(1, "Description is required"),
    investmentType: z.string().optional(),
    expectedValue: z.string().optional(),
    // .refine((val) => !isNaN(Number(val)), "Expected value must be a number"),
    currentValue: z.string().optional(),
    // .refine((val) => !isNaN(Number(val)), "Current value must be a number"),
    activationDate: z.string().optional(),
    // .min(1, "Activation date is required"),
    commitmentDeadline: z.string().optional(),
    // .min(1, "Commitment deadline is required"),
    expirationDate: z.string().optional(),
    // .min(1, "Expiry date is required"),
    status: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    // File uploads
    featuredImage: z
      .any()
      .refine(
        (val) =>
          isEditMode
            ? typeof val === "string" || val instanceof File || val === null
            : val instanceof File,
        {
          message: "Featured image is required",
        }
      ),

    video: z.any().optional(),
    // .refine(
    //   (val) =>
    //     isEditMode
    //       ? !val || typeof val === "string" || val instanceof File
    //       : !val || val instanceof File,
    //   {
    //     message: "Video must be a file",
    //   }
    // ),

    galleryImages: z
      .array(z.any())
      // .refine(
      //   (arr) =>
      //     isEditMode
      //       ? arr.every((f) => typeof f === "string" || f instanceof File)
      //       : arr.every((f) => f instanceof File),
      //   {
      //     message: "Invalid gallery images",
      //   }
      // )
      .optional(),

    docs: z
      .array(z.any())
      // .refine(
      //   (arr) =>
      //     isEditMode
      //       ? arr.every((f) => typeof f === "string" || f instanceof File)
      //       : arr.every((f) => f instanceof File),
      //   {
      //     message: "Invalid document format",
      //   }
      // )
      .optional(),
    // Buttons are not part of schema

    projectedReturn: z.string().optional(),
    // .refine(
    //   (val) => !isNaN(Number(val)),
    //   "Projected return must be a number"
    // ),

    investmentDuration: z
      .string()
      // .refine(
      //   (val) => !isNaN(Number(val)),
      //   "Investment duration must be a number"
      // ),
      .optional(),

    minInvestment: z
      .string()
      // .refine(
      //   (val) => !isNaN(Number(val)),
      //   "Minimum investment must be a number"
      // ),
      .optional(),

    state: z.string().optional(),
    // .min(1, "State is required"),
    area: z.string().optional(),
    // .min(1, "Area is required"),
    terms: z.string().optional(),

    // Dropdown field for category
    category: z.string().min(1, "Category is required"),

    subscriptionFee: z
      .string()
      // .refine(
      //   (val) => !isNaN(Number(val)),
      //   "Subscription fee must be a number"
      // ),
      .optional(),

    managementFee: z
      .string()
      // .refine((val) => !isNaN(Number(val)), "Management fee must be a number"),
      .optional(),

    performanceFee: z
      .string()
      // .refine((val) => !isNaN(Number(val)), "Performance fee must be a number"),
      .optional(),

    // ✅ New: FAQs validation
    faqs: z
      .array(
        z.object({
          question: z.string(),
          // .min(1, "FAQ question is required"),
          answer: z.string(),
          // .min(1, "FAQ answer is required"),
        })
      )
      .optional(),
  });
