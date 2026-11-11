import { db } from "@/server/db";
import * as authSchema from "@/server/db/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

/** Authentification du site : comptes, connexion et sessions. */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
