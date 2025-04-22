import MalcoAsset from "../models/MalcoAsset";
import { categories, malcoAssets, subCategories } from "../data/pandaConnect";
import { connectToDatabase } from "../lib/db";
import Category from "../models/Category";
import Subcategory from "../models/SubCategory";
async function seed() {
  try {
    await connectToDatabase();

    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await MalcoAsset.deleteMany({});

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log("Categories seeded");

    // Insert subcategories with category name as reference
    const createdSubcategories = await Subcategory.insertMany(
      subCategories.map((subcat) => {
        const category = createdCategories.find(
          (cat) => cat.name.toLowerCase() === subcat.category.toLowerCase()
        );
        return {
          name: subcat.name,
          category: category?.name, // your model uses name as ref
        };
      })
    );
    console.log("Subcategories seeded");

    // Insert malcoAssets with category and subCategory names as references
    const assetsToInsert = malcoAssets.map((asset) => {
      const category = createdCategories.find(
        (cat) => cat.name.toLowerCase() === asset.category.toLowerCase()
      );
      const subCategory = createdSubcategories.find(
        (sub) => sub.name.toLowerCase() === asset.subCategory.toLowerCase()
      );

      return {
        ...asset,
        category: category?.name,
        subCategory: subCategory?.name,
      };
    });

    console.log("assetsToInsert", assetsToInsert);
    await MalcoAsset.insertMany(assetsToInsert);
    console.log("MalcoAssets seeded");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
