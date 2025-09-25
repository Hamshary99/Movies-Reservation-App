import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/models/index.ts",
  out: "./drizzle/migration", // migrations folder
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
