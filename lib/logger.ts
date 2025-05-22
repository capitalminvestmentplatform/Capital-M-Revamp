export const log = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[DEBUG]", ...args);
  }
};
export const error = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", ...args);
  }
};
