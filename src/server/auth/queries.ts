import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

/**
 * Lit la session de l'utilisateur connecté, à partir du cookie de la requête.
 * Ne bloque rien, récupère seulement les données de `session`.
 *
 * @returns la session (`user` et `session`), ou `null` pour un visiteur
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Exige un utilisateur connecté : renvoie vers `/login` si personne n'est connecté.
 * À appeler en tête des pages et des actions réservées aux comptes connectés.
 *
 * @returns la session de l'utilisateur connecté, jamais `null`
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Exige un admin connecté : renvoie vers `/login` si personne n'est connecté,
 * et vers une 404 si le compte n'est pas `admin`.
 *
 * @returns la session de l'admin connecté
 */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    notFound();
  }
  return session;
}
