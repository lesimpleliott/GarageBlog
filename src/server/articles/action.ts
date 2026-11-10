"use server";

import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Réponse renvoyée au formulaire : messages d'erreur et saisie à réafficher. */
export type ArticleFormState = {
  errors?: { title?: string; body?: string };
  values?: { title: string; body: string };
};

type ArticleValidation =
  | { ok: false; state: ArticleFormState }
  | { ok: true; data: { title: string; body: string } };

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
  const errors: { title?: string; body?: string } = {};

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
  const result = validateArticle(formData);
  if (!result.ok) {
    return result.state;
  }

  // INSERT INTO articles (title, body) VALUES (...)
  await db.insert(articles).values(result.data);

  // Rafraîchit la liste des articles et y renvoie l'utilisateur
  revalidatePath("/articles");
  redirect("/articles");
}

/** MODIFIER UN ARTICLE AVEC SON ID */
export async function updateArticle(
  id: number,
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  if (!Number.isInteger(id)) {
    throw new Error("Article invalide.");
  }

  const result = validateArticle(formData);
  if (!result.ok) {
    return result.state;
  }

  // UPDATE du tableau `articles`
  await db.update(articles).set(result.data).where(eq(articles.id, id));

  // Rafraîchit la liste des articles et y renvoie l'utilisateur
  revalidatePath("/articles");
  redirect("/articles");
}

/** Supprime un article, puis renvoie vers la liste. */
export async function deleteArticle(id: number) {
  if (!Number.isInteger(id)) {
    throw new Error("Article invalide.");
  }

  // DELETE FROM articles WHERE id = ...
  await db.delete(articles).where(eq(articles.id, id));

  revalidatePath("/articles");
  redirect("/articles");
}
