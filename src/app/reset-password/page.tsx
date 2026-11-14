import ChooseNewPasswordForm from "@/blocks/ChooseNewPasswordForm";
import Link from "next/link";

/**
 * Page d'arrivée du lien de réinitialisation reçu par e-mail.
 * Better Auth vérifie le jeton puis redirige ici, avec `?token=…` si le lien est valide,
 * ou `?error=INVALID_TOKEN` s'il a expiré ou a déjà servi.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token, error } = await searchParams;

  // Lien expiré, déjà utilisé ou adresse trafiquée : on propose de refaire une demande
  if (error || typeof token !== "string") {
    return (
      <>
        <h1>Lien expiré</h1>
        <p className="mt-4">
          Ce lien n&apos;est plus valide : il a expiré ou a déjà servi.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block underline transition-colors hover:text-foreground-secondary"
        >
          Refaire une demande
        </Link>
      </>
    );
  }

  return (
    <>
      <h1>Nouveau mot de passe</h1>
      <ChooseNewPasswordForm token={token} />
    </>
  );
}
