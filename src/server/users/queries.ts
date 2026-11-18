import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { account } from "@/server/db/schema/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Récupère tous les comptes, triés par nom (A → Z), via le guichet `listUsers` de Better Auth.
 * Réservé aux admins : Better Auth lit la session dans les en-têtes, et lance une erreur sinon.
 * La page qui l'appelle doit donc d'abord passer par `requireAdmin()`, pour afficher une 404 propre.
 *
 * @returns la liste des comptes, avec leur `role`, `email`, `name`...
 */
export async function getUsers() {
  const { users } = await auth.api.listUsers({
    headers: await headers(),
    query: { sortBy: "name", sortDirection: "asc" },
  });

  return users;
}

/**
 * Liste les users qui ont choisi leur mot de passe.
 * Better Auth crée une ligne `account` (`providerId` = `"credential"`) au moment où le mot de passe est choisi :
 * un invité qui n'a pas encore utilisé son lien n'en a pas.
 * Aucune vérification de rôle ici : à n'appeler que depuis une page déjà protégée par `requireAdmin()`.
 *
 * @returns les `id` des comptes avec mot de passe, dans un `Set` pour tester chaque ligne avec `.has(user.id)`
 */
export async function getUserIdsWithPassword() {
  const rows = await db
    .select({ userId: account.userId })
    .from(account)
    .where(eq(account.providerId, "credential"));

  return new Set(rows.map((row) => row.userId));
}
