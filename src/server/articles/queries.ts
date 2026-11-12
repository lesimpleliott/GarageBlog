import { db } from "@/server/db";
import { articles } from "@/server/db/schema/articles";
import { user } from "@/server/db/schema/auth";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";

/**
 * Récupère tous les articles, du plus récent au plus ancien.
 * Chaque article contient aussi `authorName`, le nom de son auteur, lu dans le tableau `user` par une jointure.
 * Seul le nom est sélectionné : jamais l'e-mail ni les autres données du compte.
 *
 * @returns la liste des articles, vide s'il n'y en a aucun
 */
export async function getArticles() {
  await connection();

  // (SQL:) SELECT articles.*, user.name FROM articles INNER JOIN user ON articles.author_id = user.id ORDER BY created_at DESC
  return db
    .select({ ...getTableColumns(articles), authorName: user.name })
    .from(articles)
    .innerJoin(user, eq(articles.authorId, user.id))
    .orderBy(desc(articles.createdAt));
}

/**
 * Récupère un article à partir de son id, avec le nom de son auteur (`authorName`).
 * Affiche la page 404 si l'id n'est pas un entier ou si aucun article ne correspond.
 * Si la fonction rend la main, l'article existe.
 *
 * @param id - l'id de l'article, tel qu'il arrive de l'URL (donc en texte)
 * @returns l'article, avec `authorName`
 */
export async function getArticle(id: string) {
  // await connection() // pas obligatoire, implicite avec une page qui a un params, la page est construite à chaque visite

  // Convertit en `number` pour utilisation
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    notFound();
  }

  // Recupère l'article
  const [article] = await db
    .select({ ...getTableColumns(articles), authorName: user.name })
    .from(articles)
    .innerJoin(user, eq(articles.authorId, user.id))
    .where(eq(articles.id, articleId));

  // Aucun article avec cet id : 404
  if (!article) {
    notFound();
  }

  return article;
}
