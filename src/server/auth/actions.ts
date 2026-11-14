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

/** Réponse renvoyée au formulaire de mot de passe oublié. */
export type ForgotPasswordFormState = { sent?: boolean };

/** Demande l'envoi d'un lien de réinitialisation du mot de passe.
 * Renvoie toujours { sent: true }, que le compte existe ou non : on ne révèle pas quels e-mails sont inscrits. */
export async function forgotPassword(
  _prevState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const email = formData.get("email");

  if (typeof email !== "string") {
    throw new Error("E-mail invalide.");
  }

  await auth.api.requestPasswordReset({
    headers: await headers(),
    body: { email, redirectTo: "/reset-password" },
  });

  return { sent: true };
}

/** Réponse renvoyée au formulaire de nouveau mot de passe : le mot de passe n'y est jamais renvoyé. */
export type ChooseNewPasswordFormState = {
  error?: string;
};

/**
 * Enregistre le nouveau mot de passe choisi depuis le lien de réinitialisation, puis renvoie vers `/login`.
 * Better Auth supprime le jeton (usage unique) et ferme toutes les sessions du compte (`revokeSessionsOnPasswordReset`).
 *
 * Renvoie une erreur au formulaire si les deux mots de passe diffèrent, si le mot de passe est trop court,
 * ou si le lien a expiré ou a déjà servi.
 *
 * @param token - le jeton lu dans l'adresse de `/reset-password`, fixé par `.bind` dans le formulaire
 * @param _prevState - la réponse précédente, imposée par `useActionState` et inutilisée
 * @param formData - les champs `password` et `confirmPassword`
 */
export async function chooseNewPassword(
  token: string,
  _prevState: ChooseNewPasswordFormState,
  formData: FormData,
): Promise<ChooseNewPasswordFormState> {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof password !== "string" || typeof confirmPassword !== "string") {
    throw new Error("Formulaire invalide.");
  }

  if (password !== confirmPassword) {
    return {
      error: "Les deux mots de passe ne correspondent pas.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Le mot de passe doit avoir au minimum 8 caractères.",
    };
  }

  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: { newPassword: password, token },
    });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        error:
          "Ce lien ne semble plus valide. Refaites une demande de mot de passe oublié.",
      };
    }
    throw error;
  }

  redirect("/login");
}
