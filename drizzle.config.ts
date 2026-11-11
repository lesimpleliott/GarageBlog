import { defineConfig } from "drizzle-kit";

process.loadEnvFile(".env.local"); // Charge .env.local dans process.env, que drizzle-kit ne lit pas seul.

export default defineConfig({
  dialect: "mysql", // language SQL utilisé
  schema: ["./src/server/db/schema.ts", "./src/server/db/auth-schema.ts"], // le plan des bases pour `generate`
  out: "./drizzle", // où stocker les migrations et /meta
  dbCredentials: {
    url: process.env.DATABASE_URL!, // l'adresse de la base `DATABASE_URL`, pour le `migrate`.
  },
});
