"use server";

import { auth } from "@/server/auth";
import { requireAdmin } from "@/server/auth/queries";
import { isRole } from "@/utils/roles";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Change le rôle d'un compte, via le guichet `setRole` de Better Auth, puis rafraîchit la liste des comptes.
 * Réservé aux admins : `requireAdmin()` renvoie vers `/login` ou une 404, et Better Auth vérifie à nouveau.
 * Lance une erreur si le rôle envoyé n'est pas un rôle connu (voir `ROLE_LABELS`).
 *
 * @param userId - l'id du compte visé, fixé par `.bind` dans la page `/admin/users`
 * @param formData - les champs envoyés par le formulaire (`role`)
 */
export async function setUserRole(userId: string, formData: FormData) {
  // Vérifie qu'un admin est connecté avant de continuer
  await requireAdmin();

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
