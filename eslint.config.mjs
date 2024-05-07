import babelParser from "@babel/eslint-parser";

import globals from "globals";

export default [
    {
        languageOptions: {
            parser: babelParser,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    // Override the recommended config
    {
        files: ["**/test/**/*.{j,t}s?(x)"],
        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },
    },

];
