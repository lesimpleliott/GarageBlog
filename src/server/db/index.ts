import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Le pool de connexions vers MariaDB
const pool = mysql.createPool(process.env.DATABASE_URL!);

// Chaque nouvelle connexion parle en UTC, quel que soit le fuseau du serveur (CET sur o2switch)
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

// Accès à la base : toutes les requêtes du site passent par cet objet.
export const db = drizzle({
  client: pool,
  logger: process.env.NODE_ENV !== "production", // Affiche chaque requête SQL dans le terminal, sauf en production.
});
