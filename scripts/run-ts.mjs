// Bundles a TypeScript entry with esbuild (already installed via Vite) and runs it in Node.
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const entry = process.argv[2];
const out = join(tmpdir(), `yj-${Date.now()}.mjs`);
await build({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error" });
await import(pathToFileURL(out).href);
