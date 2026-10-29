import tseslint from "typescript-eslint";
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "packages/export/generated/**",
      "coverage/**",
      "test-results/**",
      ".artifacts/**",
      "playwright-report/**",
    ],
  },
  ...tseslint.configs.recommended,
);
