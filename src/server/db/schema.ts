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
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/** TYPE : Un article tel qu'il est lu dans la base. */
export type Article = typeof articles.$inferSelect;

/** TYPE : Les champs qu'on saisit dans le formulaire d'article. */
export type ArticleFields = Pick<Article, "title" | "body">;
