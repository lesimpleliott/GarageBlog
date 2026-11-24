"use server";

import { requireEditableArticle } from "@/server/articles/permissions";
import { requireSession } from "@/server/auth/queries";
import { db } from "@/server/db";
import { type ArticleFields, articles } from "@/server/db/schema/articles";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Réponse renvoyée au formulaire : messages d'erreur et saisie à réafficher. */
export type ArticleFormState = {
  errors?: Partial<ArticleFields>;
  values?: ArticleFields;
};

type ArticleValidation =
  { ok: false; state: ArticleFormState } | { ok: true; data: ArticleFields };

function validateArticle(formData: FormData): ArticleValidation {
  // Récupère les données brutes des champs et vérifie que c'est bien du texte
  const rawTitle = formData.get("title");
  const rawBody = formData.get("body");
  if (typeof rawTitle !== "string" || typeof rawBody !== "string") {
    throw new Error("Formulaire invalide.");
  }

  // Formate (retire les espaces en trop), puis vérifie la saisie et note les erreurs
  const title = rawTitle.trim();
  const body = rawBody.trim();
  const errors: Partial<ArticleFields> = {};

  // Vérifie le TITRE
  if (!title) {
    errors.title = "Le titre est obligatoire.";
  } else if (title.length > 200) {
    errors.title = "Le titre ne doit pas dépasser 200 caractères.";
  }

  // Vérifie le TEXTE
  if (!body) {
    errors.body = "Le texte est obligatoire.";
  }

  // En cas d'erreur : renvoie les erreurs et la saisie d'origine, sans rien écrire
  if (errors.title || errors.body) {
    return {
      ok: false,
      state: { errors, values: { title: rawTitle, body: rawBody } },
    };
  }

  return { ok: true, data: { title, body } };
}

/**
 * Transforme la date reçue en `Date`, pour `createArticle` et `publishArticle`.
 *
 * @param publishAt - la date au format ISO, en UTC ; absente = maintenant, à l'heure du serveur
 * @returns la date de publication
 * @throws si la date reçue n'est pas une date valide
 */
function parsePublishDate(publishAt: string | undefined): Date {
  // Détermine la date
  const date = publishAt ? new Date(publishAt) : new Date();

  // Vérifie le format de la date
  if (Number.isNaN(date.getTime())) {
    throw new Error("Date de publication invalide.");
  }

  return date;
}

/**
 * Crée un article au nom de l'utilisateur connecté, puis renvoie vers la liste.
 *
 * Le bouton cliqué (`intent`) choisit le statut :
 *  - `draft` : brouillon, sans date de publication ;
 *  - `publish` : publié à la date reçue (`publishAt`, voir `parsePublishDate`), ou tout de suite si elle est absente.
 *    Une date future rend l'article « programmé ».
 *
 * Réservé aux utilisateurs connectés (`requireSession`) : sinon, lance une erreur.
 * Lance aussi une erreur si `intent` n'est ni `draft` ni `publish`, ou si la date est invalide.
 * Si la saisie est invalide, rien n'est écrit et les erreurs sont renvoyées au formulaire.
 *
 * @param _prevState - l'état précédent du formulaire, transmis par `useActionState` (inutilisé)
 * @param formData - les champs envoyés par le formulaire (`title`, `body`, `intent`, et `publishAt` en option)
 * @returns les erreurs et la saisie à réafficher, si la saisie est invalide
 */
export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  // Vérifie qu'un utilisateur est connecté avant de continuer
  const session = await requireSession();

  const result = validateArticle(formData);
  if (!result.ok) {
    return result.state;
  }

  // Récupère le bouton cliqué : brouillon ou publication
  const intent = formData.get("intent");
  // Refuse une valeur inattendue (formulaire trafiqué).
  if (intent !== "publish" && intent !== "draft") {
    throw new Error("Statut invalide.");
  }

  // Récupère la date de publication indiquée ou actuelle
  const rawPublishAt = formData.get("publishAt");
  const publishAt = typeof rawPublishAt === "string" ? rawPublishAt : undefined;

  // INSERT INTO articles (title, body, author_id, status, published_at) VALUES (...)
  await db.insert(articles).values({
    ...result.data,
    authorId: session.user.id,
    status: intent === "publish" ? "published" : "draft",
    publishedAt: intent === "publish" ? parsePublishDate(publishAt) : null,
  });

  // Rafraîchit la liste des articles et y renvoie l'utilisateur
  revalidatePath("/articles");
  redirect("/articles");
}

/**
 * Modifie un article, puis renvoie vers la liste.
 *
 * Réservé à l'auteur de l'article ou à un admin (`requireEditableArticle`) : sinon, lance une erreur.
 * Si la saisie est invalide, rien n'est écrit et les erreurs sont renvoyées au formulaire.
 *
 * @param articleId - l'id de l'article, fixé par `.bind` dans la page d'édition
 * @param _prevState - l'état précédent du formulaire, transmis par `useActionState` (inutilisé)
 * @param formData - les champs envoyés par le formulaire (`title`, `body`)
 * @returns les erreurs et la saisie à réafficher, si la saisie est invalide
 */
export async function updateArticle(
  articleId: number,
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  // Vérifie que l'article existe et que l'utilisateur a la permission d'édition de celui-ci
  await requireEditableArticle(articleId);

  const result = validateArticle(formData);
  if (!result.ok) {
    return result.state;
  }

  // UPDATE du tableau `articles`
  await db.update(articles).set(result.data).where(eq(articles.id, articleId));

  // Rafraîchit la liste des articles et y renvoie l'utilisateur
  revalidatePath("/articles");
  redirect("/articles");
}

/**
 * Supprime un article, puis renvoie vers la liste.
 *
 * Réservé à l'auteur de l'article ou à un admin (`requireEditableArticle`) : sinon, lance une erreur.
 *
 * @param articleId - l'id de l'article, fixé par `.bind` dans la page de l'article
 */
export async function deleteArticle(articleId: number) {
  // Vérifie que l'article existe et que l'utilisateur a la permission d'édition de celui-ci
  await requireEditableArticle(articleId);

  // DELETE FROM articles WHERE id = ...
  await db.delete(articles).where(eq(articles.id, articleId));

  revalidatePath("/articles");
  redirect("/articles");
}

/**
 * Publie un article, tout de suite ou à une date choisie, puis rafraîchit la liste et la page de l'article.
 *
 * Réservé à l'auteur de l'article ou à un admin (`requireEditableArticle`) : sinon, lance une erreur.
 * Lance aussi une erreur si la date reçue n'est pas une date valide.
 * Une date dans le futur rend l'article « programmé » : il reste caché aux visiteurs jusqu'à cette date (voir `getArticles`).
 * Une date passée est acceptée : l'article est publié tout de suite, avec cette date.
 *
 * @param articleId - l'id de l'article
 * @param publishAt - la date de publication au format ISO, en UTC (`toISOString()` côté navigateur) ; absente = maintenant, à l'heure du serveur
 */
export async function publishArticle(articleId: number, publishAt?: string) {
  // Vérifie que l'article existe et que l'utilisateur a la permission d'édition de celui-ci
  await requireEditableArticle(articleId);

  // Calcul de la date
  const publishedAt = parsePublishDate(publishAt);

  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error("Date de publication invalide.");
  }

  // UPDATE du tableau `articles`
  await db
    .update(articles)
    .set({ status: "published", publishedAt: publishedAt })
    .where(eq(articles.id, articleId));

  // Rafraîchit la liste des articles et la page de l'article
  revalidatePath("/articles");
  revalidatePath(`/articles/${articleId}`);
}

/**
 * Repasse un article en brouillon, puis rafraîchit la liste et la page de l'article.
 * La date de publication est effacée : la prochaine publication choisira la sienne.
 *
 * Réservé à l'auteur de l'article ou à un admin (`requireEditableArticle`) : sinon, lance une erreur.
 *
 * @param articleId - l'id de l'article
 */
export async function unpublishArticle(articleId: number) {
  // Vérifie que l'article existe et que l'utilisateur a la permission d'édition de celui-ci
  await requireEditableArticle(articleId);

  // UPDATE du tableau `articles`
  await db
    .update(articles)
    .set({ status: "draft", publishedAt: null })
    .where(eq(articles.id, articleId));

  // Rafraîchit la liste des articles et la page de l'article
  revalidatePath("/articles");
  revalidatePath(`/articles/${articleId}`);
}
