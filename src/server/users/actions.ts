"use server";

import { auth } from "@/server/auth";
import { requireAdmin } from "@/server/auth/queries";
import { isRole } from "@/utils/roles";
import { isAPIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Change le rôle d'un compte, via le guichet `setRole` de Better Auth, puis rafraîchit la liste des comptes.
 *  - Réservé aux admins : `requireAdmin()` renvoie vers `/login` ou une 404, et Better Auth vérifie à nouveau.
 *  - Lance une erreur si le rôle envoyé n'est pas un rôle connu (voir `ROLE_LABELS`).
 *  - Refuse de modifier son propre rôle : seul un autre admin peut le faire.
 *
 * @param userId - l'id du compte visé, fixé par `.bind` dans la page `/admin/users`
 * @param formData - les champs envoyés par le formulaire (`role`)
 */
export async function setUserRole(userId: string, formData: FormData) {
  // Vérifie qu'un admin est connecté avant de continuer
  const session = await requireAdmin();

  // Rend impossible la modification de son propre rôle
  if (session.user.id === userId) {
    throw new Error("Impossible de modifier son propre rôle.");
  }

  // Récupère le rôle choisi : ce qui vient d'un formulaire n'est jamais fiable, on vérifie que c'est un rôle connu
  const newRole = formData.get("role");
  if (!isRole(newRole)) {
    throw new Error("Rôle invalide.");
  }

  // UPDATE du rôle dans le tableau `user`. Les en-têtes portent le cookie : Better Auth vérifie que c'est un admin qui demande
  await auth.api.setRole({
    headers: await headers(),
    body: { userId: userId, role: newRole },
  });

  // Rafraîchit la liste des comptes
  revalidatePath("/admin/users");
}

/**
 * Change le statut d'un compte, via le guichet `banUser` de Better Auth, puis rafraîchit la liste des comptes.
 *  - Réservé aux admins : `requireAdmin()` renvoie vers `/login` ou une 404, et Better Auth vérifie à nouveau.
 *  - Refuse de modifier son propre statut : seul un autre admin peut le faire.
 *  - Déconnecte immédiatement le compte : Better Auth supprime toutes ses sessions.
 *
 * @param userId - l'id du compte visé, fixé par `.bind` dans la page `/admin/users`
 */
export async function disableUser(userId: string) {
  // Vérifie qu'un admin est connecté avant de continuer
  const session = await requireAdmin();

  // Rend impossible la modification de son propre statut
  if (session.user.id === userId) {
    throw new Error("Impossible de modifier son propre statut.");
  }

  // UPDATE de la colonne `banned` du tableau `user`. Les en-têtes portent le cookie : Better Auth vérifie que c'est un admin qui demande
  await auth.api.banUser({
    headers: await headers(),
    body: { userId: userId },
  });

  // Rafraîchit la liste des comptes
  revalidatePath("/admin/users");
}

/**
 * Change le statut d'un compte, via le guichet `unbanUser` de Better Auth, puis rafraîchit la liste des comptes.
 *  - Réservé aux admins : `requireAdmin()` renvoie vers `/login` ou une 404, et Better Auth vérifie à nouveau.
 *  - Refuse de modifier son propre statut : seul un autre admin peut le faire.
 *
 * @param userId - l'id du compte visé, fixé par `.bind` dans la page `/admin/users`
 */
export async function enableUser(userId: string) {
  // Vérifie qu'un admin est connecté avant de continuer
  const session = await requireAdmin();

  // Rend impossible la modification de son propre statut
  if (session.user.id === userId) {
    throw new Error("Impossible de modifier son propre statut.");
  }

  // UPDATE de la colonne `banned` du tableau `user`. Les en-têtes portent le cookie : Better Auth vérifie que c'est un admin qui demande
  await auth.api.unbanUser({
    headers: await headers(),
    body: { userId: userId },
  });

  // Rafraîchit la liste des comptes
  revalidatePath("/admin/users");
}

/** Réponse renvoyée au formulaire d'invitation. */
export type InviteUserFormState = {
  error?: string;
  sent?: boolean;
  name?: string; // Renvoyé avec une erreur, pour ne pas vider le champ
  email?: string; // Idem
};

/**
 * Invite une personne : crée son compte sans mot de passe, puis lui envoie un lien pour le choisir.
 *  - Réservé aux admins : `requireAdmin()` renvoie vers `/login` ou une 404, et Better Auth vérifie à nouveau.
 *  - Le lien réutilise le mécanisme du mot de passe oublié, avec `?invite=1` dans l'adresse de retour :
 *    `sendResetPassword` (`@/server/auth`) y lit qu'il faut envoyer l'e-mail d'invitation.
 *  - Renvoie une erreur au formulaire si le nom est vide, si l'adresse est invalide ou déjà utilisée.
 *  - Lance une erreur si le formulaire a été trafiqué (champ absent, rôle inconnu).
 *
 * @param _prevState - la réponse précédente, imposée par `useActionState` et inutilisée
 * @param formData - les champs `name`, `email` et `role`
 */
export async function inviteUser(
  _prevState: InviteUserFormState,
  formData: FormData,
): Promise<InviteUserFormState> {
  // Vérifie qu'un admin est connecté avant de continuer
  await requireAdmin();

  // Récupère les champs : ce qui vient d'un formulaire n'est jamais fiable
  const rawEmail = formData.get("email");
  const rawName = formData.get("name");
  const role = formData.get("role");
  if (typeof rawName !== "string" || typeof rawEmail !== "string") {
    throw new Error("Nom ou E-mail non conforme.");
  }

  // Nettoie les valeurs : sans espaces autour, adresse en minuscules (évite les doublons)
  const email = rawEmail.trim().toLowerCase();
  const name = rawName.trim();
  if (name.length === 0) {
    return { error: "Le nom est obligatoire.", name, email };
  }
  if (!isRole(role)) {
    throw new Error("Rôle invalide.");
  }

  // Crée le compte, sans mot de passe : la personne le choisira avec le lien de l'e-mail.
  // Better Auth vérifie aussi le format de l'adresse et qu'aucun compte ne l'utilise déjà
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: { name, email, role },
    });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        error:
          error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? "Un compte existe déjà avec cette adresse."
            : "Adresse e-mail invalide.",
        name,
        email,
      };
    }
    throw error;
  }

  // Demande le lien de création du mot de passe. `?invite=1` fait choisir l'e-mail d'invitation à `sendResetPassword`
  await auth.api.requestPasswordReset({
    headers: await headers(),
    body: { email, redirectTo: "/reset-password?invite=1" },
  });

  // Rafraîchit la liste des comptes, où apparaît le nouveau compte
  revalidatePath("/admin/users");
  return { sent: true };
}
