import { signOut } from "@/server/auth/actions";
import { getSession } from "@/server/auth/queries";
import { faSignIn, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import Link from "next/link";

/** Bouton de connexion, ou de déconnexion si l'utilisateur est connecté. */
export default async function AuthButton() {
  const session = await getSession();

  const iconClassName = clsx(
    "inline-flex size-6 cursor-pointer items-center justify-center text-lg",
    "text-foreground transition-colors",
  );

  return (
    <>
      {session ? (
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Se déconnecter"
            title={`Connecté : ${session.user.name}`}
            className={clsx(iconClassName, "hover:text-red-600")}
          >
            <FontAwesomeIcon icon={faSignOut} />
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          aria-label="Se connecter"
          className={clsx(iconClassName, "hover:text-foreground-secondary")}
        >
          <FontAwesomeIcon icon={faSignIn} />
        </Link>
      )}
    </>
  );
}
