import { auth } from "@/server/auth";
import { headers } from "next/headers";

/** Renvoie la session de l'utilisateur connecté, ou null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
