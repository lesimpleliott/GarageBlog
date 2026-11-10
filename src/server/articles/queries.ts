import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";

/** RECUPERE TOUS LES ARTICLES DU TABLEAU */
export async function getArticles() {
  await connection();

  // (SQL:) SELECT * FROM articles ORDER BY created_at DESC
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

/** RECUPERE UN ARTICLE AVEC SON ID */
export async function getArticle(id: string) {
  // await connection() // pas obligatoire, implicite avec une page qui a un params, la page est construite à chauqe visite

  // Convertit en `number`pour utilisation
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    notFound();
  }

  // Recupère l'article
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId));

  // Aucun article avec cet id : 404
  if (!article) {
    notFound();
  }

  return article;
}
