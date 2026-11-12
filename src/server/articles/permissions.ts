import type { auth } from "@/server/auth";
import { requireSession } from "@/server/auth/queries";
import { db } from "@/server/db";
import { articles, type Article } from "@/server/db/schema/articles";
import { eq } from "drizzle-orm";

/**
 * Vérifie si un compte peut modifier ou supprimer un article :
 * il faut être admin, ou être l'auteur de l'article.
 *
 * @param user - le compte connecté (`session.user`). Son type est déduit de notre config Better Auth, plugins compris : il a donc un `role`
 * @param article - l'article visé : seul son `authorId` est nécessaire
 * @returns `true` si le compte a le droit, `false` sinon
 */
export const canEditArticle = (
  user: typeof auth.$Infer.Session.user,
  article: Pick<Article, "authorId">,
) => {
  return user.role === "admin" || user.id === article.authorId;
};

/**
 * Exige que le compte connecté puisse modifier ou supprimer un article.
 * À appeler en tête des actions qui modifient un article, comme `requireSession()`.
 *
 * Renvoie vers `/login` si personne n'est connecté, et lance une erreur dans les autres cas de refus.
 * Si la fonction rend la main, tout est vérifié.
 *
 * @param articleId - l'id de l'article dans le tableau `articles`
 */
export async function requireEditableArticle(articleId: number) {
  // Vérifie qu'un utilisateur est connecté avant de continuer
  const session = await requireSession();

  // Vérifie que l'id transmis est bien un `integer`
  if (!Number.isInteger(articleId)) {
    throw new Error("Article invalide.");
  }

  // Récupère l'auteur de l'article `authorId`
  const [article] = await db
    .select({ authorId: articles.authorId })
    .from(articles)
    .where(eq(articles.id, articleId));

  // Vérifie que l'article existe
  if (!article) {
    throw new Error("Article inexistant.");
  }

  // Vérifie les permissions de l'utilisateur d'éditer l'article
  if (!canEditArticle(session.user, article)) {
    throw new Error("Action non autorisée.");
  }
}
