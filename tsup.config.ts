import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    minify: true,
    minifySyntax: true,
    minifyIdentifiers: true,
    sourcemap: false,
    splitting: true,
    external: ["react", "react-dom", "moment", "crypto-js"],
})