import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Repère les classes du plugin src/devTools/testPlugin.mjs : test, test-red, md:test-sky…
const TEST_CLASS = "/(^|[\\s:])test(-[a-z]+)?(\\s|$)/";
const TEST_CLASS_MESSAGE =
  "Classe de debug test-* : à retirer avant de commiter.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=${TEST_CLASS}]`,
          message: TEST_CLASS_MESSAGE,
        },
        {
          selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${TEST_CLASS}]`,
          message: TEST_CLASS_MESSAGE,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
