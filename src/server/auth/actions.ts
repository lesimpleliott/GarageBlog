"use server";

import { auth } from "@/server/auth";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Réponse renvoyée au formulaire de connexion. */
export type SignInFormState = {
  error?: string;
  email?: string;
};

/** Connecte l'utilisateur, puis renvoie vers la liste des articles. */
export async function signIn(
  _prevState: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Formulaire invalide.");
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (isAPIError(error)) {
      return { error: "E-mail ou mot de passe incorrect.", email };
    }
    throw error;
  }

  redirect("/articles");
}

/** Déconnecte l'utilisateur, puis renvoie vers l'accueil. */
export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
