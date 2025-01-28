import dotenv from "dotenv";
import { resolve } from "path";

// Define default values
const defaults = {
  NODE_ENV: "development"
  // Add more default values as needed
};

// Load environment variables with fallback to defaults
const env = {
  ...defaults,
  ...dotenv.config({ path: resolve("./.env") }).parsed
};

// Set environment variables
Object.entries(env).forEach(([key, value]) => {
  process.env[key] ??= value;
});

export default env;
