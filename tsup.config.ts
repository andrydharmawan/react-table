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
    treeshake: true,
    external: ["react", "react-dom", "@bgscore/react-core"],
})