import { drizzle } from "drizzle-orm/mysql2";

// Accès à la base : toutes les requêtes du site passent par cet objet.
export const db = drizzle(process.env.DATABASE_URL!, {
  logger: process.env.NODE_ENV !== "production", // Affiche chaque requête SQL dans le terminal, sauf en production.
});
