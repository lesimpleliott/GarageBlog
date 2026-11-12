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

/** CREER UN ARTICLE */
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

  // INSERT INTO articles (title, body, author_id) VALUES (...)
  await db
    .insert(articles)
    .values({ ...result.data, authorId: session.user.id });

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
