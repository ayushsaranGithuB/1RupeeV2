import js from "@eslint/js";
import ts from "typescript-eslint";

export default [
  {
    ignores: ["node_modules", "dist", ".next", "build"],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
