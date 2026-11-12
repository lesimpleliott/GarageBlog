import { auth } from "@/server/auth";
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
