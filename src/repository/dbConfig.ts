import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

// Ensure required environment variables are set
const missingVariables = [];
if (!DB_HOST) missingVariables.push("DB_HOST");
if (!DB_PORT) missingVariables.push("DB_PORT");
if (!DB_USERNAME) missingVariables.push("DB_USERNAME");
if (!DB_PASSWORD) missingVariables.push("DB_PASSWORD");
if (!DB_NAME) missingVariables.push("DB_NAME");

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVariables.join(", ")}`
  );
}

// Create a new connection pool (pg)
const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT!),
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: false,
});

// Alternative with connection string (optional)
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   max: 20,
//   idleTimeoutMillis: 30_000,
//   connectionTimeoutMillis: 5_000,
// });

export const db = drizzle(pool, {
  // schema: { users: usersTable }, // uncomment when schema is ready
  logger: {
    logQuery(query, params) {
      console.log("SQL Query:", query);
      console.log("Parameters:", params);
    },
  },
});
