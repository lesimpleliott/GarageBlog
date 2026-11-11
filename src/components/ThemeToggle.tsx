"use client";

import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Bouton qui bascule entre le thème clair et le thème sombre.
 * L'icône affiche le mode actuellement sélectionné.
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Le serveur ne connaît pas le thème : l'icône n'apparaît que dans le navigateur.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";
  const label = isClient ? `Theme: ${isDark ? "Dark" : "Light"}` : "Theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={clsx(
        "inline-flex size-6 cursor-pointer items-center justify-center text-lg",
        "text-foreground transition-colors hover:text-foreground-secondary",
      )}
    >
      {isClient && <FontAwesomeIcon icon={isDark ? faMoon : faSun} />}
    </button>
  );
}
