import clsx from "clsx";

// CONFIG Couleurs
export type PillTone = "green" | "orange" | "red" | "gray";
const TONE_CLASSES: Record<PillTone, string> = {
  green: clsx(
    "bg-emerald-100 text-emerald-600 border-emerald-400",
    "dark:bg-emerald-700/40 dark:border-emerald-700",
  ),
  orange: clsx(
    "bg-amber-100 text-amber-600 border-amber-400",
    "dark:bg-amber-700/40 dark:border-amber-700",
  ),
  red: clsx(
    "bg-red-100 text-red-600 border-red-400",
    "dark:bg-red-800/40 dark:border-red-800",
  ),
  gray: clsx(
    "text-foreground border-foreground-secondary",
    "bg-foreground-secondary/40",
  ),
};

/**
 * Pastille de texte colorée, purement visuelle (un `span`).
 * Pour la rendre cliquable, la placer dans un `button` qui porte le clic, le survol et l'`aria-label`.
 *
 * @param tone - la couleur : `green`, `orange` ou `red`
 * @param text - le texte affiché
 * @param className - classes ajoutées à celles de la pastille
 * @param disabled - affiche la pastille estompée, avec un curseur « interdit »
 * @returns la pastille
 */
export function Pill({
  tone,
  text,
  className,
  disabled,
}: {
  tone: PillTone;
  text: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 text-xs",
        "rounded-full border",
        disabled && "cursor-not-allowed opacity-50",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {text}
    </span>
  );
}
