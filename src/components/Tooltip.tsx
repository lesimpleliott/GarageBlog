import clsx from "clsx";
import { useId, type ReactNode } from "react";

type TooltipPosition = "top" | "right" | "bottom" | "left";

type TooltipProps = {
  children: ReactNode;
  content: string;
  position?: TooltipPosition;
};

// Place la bulle contre le déclencheur, centrée sur l'autre axe
const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  right: "top-1/2 left-full ml-2 -translate-y-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "top-1/2 right-full mr-2 -translate-y-1/2",
};

/**
 * Affiche une infobulle au survol et au focus clavier de son contenu, en CSS uniquement (pas de `"use client"`).
 * Le déclencheur est atteignable avec Tab, et le texte est relié par `aria-describedby` pour les lecteurs d'écran.
 *
 * @param children - l'élément qui déclenche l'infobulle (texte, icône…)
 * @param content - le texte de l'infobulle
 * @param position - le côté où s'ouvre la bulle, `right` par défaut
 */
export default function Tooltip({
  children,
  content,
  position = "right",
}: TooltipProps) {
  const id = useId();

  return (
    <span
      tabIndex={0}
      aria-describedby={id}
      className="group relative inline-flex"
    >
      {children}
      <span
        id={id}
        role="tooltip"
        className={clsx(
          "absolute z-10 rounded px-2 py-1 text-xs font-medium whitespace-nowrap",
          "bg-foreground/50 text-background backdrop-blur-sm",
          "border border-foreground-secondary",
          "invisible opacity-0 transition", // `invisible` en plus de `opacity-0` : la bulle cachée ne capte pas le survol
          "group-hover:visible group-hover:opacity-100",
          "group-focus:visible group-focus:opacity-100",
          POSITION_CLASSES[position],
        )}
      >
        {content}
      </span>
    </span>
  );
}
