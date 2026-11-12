import { defineConfig } from "drizzle-kit";

// Fichier de variables à charger : .env.local par défaut, ou celui indiqué par ENV_FILE
process.loadEnvFile(process.env.ENV_FILE ?? ".env.local");

export default defineConfig({
  dialect: "mysql", // langage SQL utilisé
  schema: "./src/server/db/schema", // le dossier des plans des tableaux, lu par `generate`
  out: "./drizzle", // où stocker les migrations et /meta
  dbCredentials: {
    url: process.env.DATABASE_URL!, // l'adresse de la base `DATABASE_URL`, pour le `migrate`.
  },
});
