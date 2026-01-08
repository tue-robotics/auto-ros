import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    {
        ignores: ["dist/**", "src/types/**"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: "./tsconfig.test.json",
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    // Override for test files
    {
        files: ["**/test/**/*.ts", "**/test/**/*.tsx"],
        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },
        rules: {
            "@typescript-eslint/no-unused-expressions": "off",
        },
    },
];
