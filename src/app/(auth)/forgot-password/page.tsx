import ForgotPasswordForm from "@/blocks/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <h1>Mot de passe oublié</h1>
      <p className="mt-4 max-w-sm text-foreground-secondary">
        Indiquez l&apos;adresse e-mail de votre compte : vous recevrez un lien
        pour choisir un nouveau mot de passe, valable 24 heures.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
