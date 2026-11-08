"use server";

import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Réponse renvoyée au formulaire : messages d'erreur et saisie à réafficher. */
export type ArticleFormState = {
  errors?: { title?: string; body?: string };
  values?: { title: string; body: string };
};

/** Crée un article à partir du formulaire, puis renvoie vers la liste. */
export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
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

  if (!title) {
    errors.title = "Le titre est obligatoire.";
  } else if (title.length > 200) {
    errors.title = "Le titre ne doit pas dépasser 200 caractères.";
  }

  if (!body) {
    errors.body = "Le texte est obligatoire.";
  }

  // En cas d'erreur : renvoie les erreurs et la saisie d'origine, sans rien écrire
  if (errors.title || errors.body) {
    return { errors, values: { title: rawTitle, body: rawBody } };
  }

  // INSERT INTO articles (title, body) VALUES (...)
  await db.insert(articles).values({ title, body });

  // Rafraîchit la liste des articles et y renvoie l'utilisateur
  revalidatePath("/articles");
  redirect("/articles");
}
