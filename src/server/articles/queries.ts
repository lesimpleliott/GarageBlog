import { getSession } from "@/server/auth/queries";
import { db } from "@/server/db";
import { articles } from "@/server/db/schema/articles";
import { user } from "@/server/db/schema/auth";
import { and, desc, eq, getTableColumns, lte, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";

/**
 * Construit la condition SQL des articles visibles par la personne qui regarde (la règle est détaillée dans `getArticles`).
 * Partagée par `getArticles` et `getArticle`, pour que la règle n'existe qu'à un seul endroit.
 *
 * @returns la condition à passer à `.where()`, ou `undefined` pour un admin (aucun filtre)
 */
async function getVisibilityCondition() {
  // Qui regarde ? `null` pour un visiteur
  const session = await getSession();

  // Ce que tout le monde peut voir : articles publiés dont la date de publication est passée.
  const isPublic = and(
    eq(articles.status, "published"),
    lte(articles.publishedAt, new Date()),
  );

  // Ce que les `users` (`admin` et `author`) peuvent voir
  const visibility =
    session?.user.role === "admin"
      ? undefined
      : session?.user
        ? or(isPublic, eq(articles.authorId, session.user.id))
        : isPublic;

  return visibility;
}

/**
 * Récupère les articles visibles par la personne qui regarde, du plus récemment publié au plus ancien :
 *  - visiteur : les articles publiés dont la date de publication est passée (ni brouillons ni programmés) ;
 *  - auteur : ceux-là, plus tous les siens (brouillons et programmés compris) ;
 *  - admin : tous les articles.
 * Les brouillons sans date de publication arrivent en fin de liste (`NULL` est rangé en dernier par `DESC`).
 * Chaque article contient aussi `authorName`, le nom de son auteur, lu dans le tableau `user` par une jointure.
 * Seul le nom est sélectionné : jamais l'e-mail ni les autres données du compte.
 *
 * @returns la liste des articles visibles, vide s'il n'y en a aucun
 */
export async function getArticles() {
  await connection();
  const visibility = await getVisibilityCondition();

  // (SQL:) SELECT articles.*, user.name FROM articles INNER JOIN user ON articles.author_id = user.id
  //        WHERE <visibility> ORDER BY published_at DESC  (sans WHERE pour un admin)
  return db
    .select({ ...getTableColumns(articles), authorName: user.name })
    .from(articles)
    .innerJoin(user, eq(articles.authorId, user.id))
    .where(visibility)
    .orderBy(desc(articles.publishedAt));
}

/**
 * Récupère un article à partir de son id, avec le nom de son auteur (`authorName`).
 * Affiche la page 404 si l'id n'est pas un entier, si aucun article ne correspond,
 * ou si l'article n'est pas visible par la personne qui regarde (brouillon ou programmé d'un autre, voir `getArticles`).
 * La 404 ne révèle pas qu'un article caché existe.
 * Si la fonction rend la main, l'article existe et peut être lu.
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

  // Récupère l'article
  const [article] = await db
    .select({ ...getTableColumns(articles), authorName: user.name })
    .from(articles)
    .innerJoin(user, eq(articles.authorId, user.id))
    .where(and(eq(articles.id, articleId), await getVisibilityCondition()));

  // Aucun article visible avec cet id : 404
  if (!article) {
    notFound();
  }

  return article;
}
