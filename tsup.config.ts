import { defineConfig } from "tsup";

export default defineConfig({
    entry: [
        "./src/index.ts"
    ],
    format: [
        "cjs"
    ],
    clean: true,
    sourcemap: true,
    external: [
        "typescript",
        "vscode"
    ]
});