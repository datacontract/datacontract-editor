import pluginJs from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["**/templates.js", "**/*.config.[c]js"],
  },
  {
    name: "project-options",
    languageOptions: { 
      globals: globals.browser 
    },
    files: ["src/**/*.js"],
  },
  pluginJs.configs.recommended,
];