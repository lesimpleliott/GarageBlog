"use server";

import { db } from "@/server/db";
import { articles } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Crée un article à partir du formulaire, puis renvoie vers la liste. */
export async function createArticle(formData: FormData) {
  const rawTitle = formData.get("title");
  const rawBody = formData.get("body");

  if (typeof rawTitle !== "string" || typeof rawBody !== "string") {
    throw new Error("Formulaire invalide.");
  }

  const title = rawTitle.trim();
  const body = rawBody.trim();

  if (!title || title.length > 200 || !body) {
    throw new Error("Titre (200 caractères max) et texte obligatoires.");
  }

  // INSERT INTO articles (title, body) VALUES (...)
  await db.insert(articles).values({ title, body });

  revalidatePath("/articles");
  redirect("/articles");
}
