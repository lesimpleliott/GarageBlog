import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Renvoie la session de l'utilisateur connecté, ou null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Renvoie la session de l'utilisateur connecté, ou renvoie vers /login si `null`. */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
