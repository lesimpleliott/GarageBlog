import Navbar from "@/blocks/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import ResponsiveTester from "@/devTools/ResponsiveTester";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans, VT323 } from "next/font/google";
import "../styles/globals.css";

config.autoAddCss = false; // Evite le problème de taille à l’affichage initial des icônes FontAwesome

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Garage Blog",
  description: "Blog d'apprentissage Next.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${ibmPlexSans.variable} ${vt323.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background font-main text-foreground">
        <ThemeProvider>
          <Navbar />
          <main className="page-container flex-1 py-10">{children}</main>

          {/* DevTools */}
          {process.env.NODE_ENV === "development" && <ResponsiveTester />}
        </ThemeProvider>
      </body>
    </html>
  );
}
