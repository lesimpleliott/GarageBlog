"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Fournit le thème à toute l'application. Le choix est enregistré dans le
 * navigateur et le thème de départ suit le réglage de l'ordinateur.
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <NextThemesProvider attribute="class">{children}</NextThemesProvider>;
}
