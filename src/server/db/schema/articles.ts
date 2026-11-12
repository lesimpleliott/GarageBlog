import { user } from "@/server/db/schema/auth";
import { sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

/** Tableau des articles du blog. */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  authorId: varchar("author_id", { length: 36 })
    .notNull()
    .references(
      () => user.id, // clé étrangère : pointe vers la colonne `id` du tableau `user`.
      { onDelete: "restrict" }, // la base refuse de supprimer un compte qui a des articles.
    ),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/** TYPE : Un article tel qu'il est lu dans la base. */
export type Article = typeof articles.$inferSelect;

/** TYPE : Les champs qu'on saisit dans le formulaire d'article. */
export type ArticleFields = Pick<Article, "title" | "body">;
