/**
 * testPlugin : plugin Tailwind 4 qui crée des classes de debug pour repérer un bloc,
 * avec une bordure et un fond transparent, toujours dans la nuance 500.
 *
 * Mise en place, dans le fichier CSS qui importe Tailwind (chemin relatif à ce fichier) :
 *
 *   @plugin "../devTools/testPlugin.mjs";
 *
 * Utilisation :
 *
 *   test            gris
 *   test-red        n'importe quelle couleur de la palette Tailwind
 *   md:test-sky     avec un breakpoint ou une autre variante
 *
 * Les classes ne sont générées qu'en développement : une classe oubliée n'a aucun effet en production.
 *
 * Alerte (optionnelle) : signale en orange ces classes dans `className`.
 * À ajouter dans eslint.config.mjs :
 *
 *   // Avant defineConfig
 *   const TEST_CLASS = "/(^|[\\s:])test(-[a-z]+)?(\\s|$)/";
 *   const TEST_CLASS_MESSAGE =
 *     "Classe de debug test-* : à retirer avant de commiter.";
 *
 *   // Dans defineConfig([...])
 *   {
 *     rules: {
 *       "no-restricted-syntax": [
 *         "warn",
 *         {
 *           selector: `JSXAttribute[name.name='className'] Literal[value=${TEST_CLASS}]`,
 *           message: TEST_CLASS_MESSAGE,
 *         },
 *         {
 *           selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${TEST_CLASS}]`,
 *           message: TEST_CLASS_MESSAGE,
 *         },
 *       ],
 *     },
 *   },
 */
import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

export default plugin(({ matchUtilities }) => {
  if (process.env.NODE_ENV !== "development") return;

  const values = { DEFAULT: colors.gray[500] };
  for (const [name, shades] of Object.entries(colors)) {
    if (shades?.[500]) values[name] = shades[500];
  }

  matchUtilities(
    {
      test: (color) => ({
        border: `1px solid ${color}`,
        background: `color-mix(in oklab, ${color} 20%, transparent)`,
      }),
    },
    { values },
  );
});
