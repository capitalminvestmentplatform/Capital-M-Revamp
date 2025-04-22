import mongoose from "mongoose";

const MONGO_URI =
  "mongodb+srv://inaam:USpCXWxtplDzbYek@cluster0.qpn51.mongodb.net/capital-m?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env.local");
}

// Use global object to track connection across hot reloads (useful for Next.js)
declare global {
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

export const connectToDatabase = async () => {
  if (global.mongooseConnection) {
    return global.mongooseConnection;
  }

  try {
    global.mongooseConnection = mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");
    return global.mongooseConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Ensure connection runs only once when the server starts
connectToDatabase();
