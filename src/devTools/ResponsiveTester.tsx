/**
 * ResponsiveTester : affiche le breakpoint actif et la largeur de la fenêtre,
 * en bas à droite de l'écran.
 *
 * Mise en place, dans le layout racine :
 *
 *   import ResponsiveTester from "@/devTools/ResponsiveTester";
 *
 *   {process.env.NODE_ENV === "development" && <ResponsiveTester />}
 *
 * Le composant ne s'affiche pas en production, mais son code reste dans le JS envoyé.
 */
"use client";

import { useEffect, useState } from "react";

type Breakpoint = "xs" | "xsm" | "sm" | "md" | "lg" | "xl" | "2xl";

/** Indicateur du breakpoint actif et de la largeur de la fenêtre. */
const ResponsiveTester: React.FC = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | "">("");
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const getBreakpoint = (w: number): Breakpoint => {
      if (w < 480) return "xs";
      if (w < 640) return "xsm";
      if (w < 768) return "sm";
      if (w < 1024) return "md";
      if (w < 1280) return "lg";
      if (w < 1536) return "xl";
      return "2xl";
    };

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
      setBreakpoint(getBreakpoint(currentWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Evite le rendu tant que `width` n'est pas défini
  if (width === null) return null;

  return (
    <div className="fixed right-0 bottom-0 z-90 flex items-center justify-end bg-gray-900 py-1 pr-2 pl-4">
      <p className="text-xs text-white">
        {breakpoint.toUpperCase()} - {width}px
      </p>
    </div>
  );
};

export default ResponsiveTester;
