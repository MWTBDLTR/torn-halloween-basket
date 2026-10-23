import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { findUpgrade } from "./src/upgrades.js";

const root = dirname(fileURLToPath(import.meta.url));
const pkgFile = join(root, "package.json");
const metaFile = join(root, "src", "meta.txt");
const routeFile = join(root, "ROUTE.md");
const watched = [routeFile, metaFile, pkgFile];
const outfile = join(root, "dist", "torn_halloween_basket.user.js");

function header() {
  const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
  return readFileSync(metaFile, "utf8").replaceAll("{{version}}", pkg.version).trimEnd();
}

function parseRoute(md) {
  const steps = [];
  const never = [];
  const errors = [];
  const seen = new Set();
  let inNever = false;
  const body = md.replace(/<!--[\s\S]*?-->/g, "");
  body.split("\n").forEach((line, i) => {
    const heading = /^#+\s+(.*)$/.exec(line);
    if (heading) {
      inNever = /never/i.test(heading[1]);
      return;
    }
    const numbered = /^\s*\d+\.\s+(.+?)\s*$/.exec(line);
    const bullet = inNever && /^\s*[-*]\s+(.+?)\s*$/.exec(line);
    const item = numbered ?? bullet;
    if (!item) return;
    const [ref, ...rest] = item[1].split(" - ");
    const up = findUpgrade(ref);
    if (!up) return errors.push(`ROUTE.md:${i + 1}: unknown upgrade "${ref.trim()}"`);
    if (seen.has(up.id)) return errors.push(`ROUTE.md:${i + 1}: "${up.name}" is listed twice`);
    seen.add(up.id);
    if (numbered) steps.push({ id: up.id, name: up.name, tier: up.tier, note: rest.join(" - ").trim() });
    else never.push(up.id);
  });
  if (errors.length) throw new Error(errors.join("\n"));
  return { steps, never };
}

const routePlugin = {
  name: "route",
  setup(build) {
    build.onResolve({ filter: /^virtual:route$/ }, () => ({ path: "ROUTE.md", namespace: "route" }));
    build.onLoad({ filter: /.*/, namespace: "route" }, () => {
      try {
        const steps = parseRoute(readFileSync(routeFile, "utf8"));
        return { contents: JSON.stringify(steps), loader: "json", watchFiles: watched };
      } catch (e) {
        return { errors: [{ text: e.message }], watchFiles: watched };
      }
    });
  },
};

const cleanPlugin = {
  name: "clean",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length || !result.outputFiles) return;
      const code = result.outputFiles[0].text
        .replace(/^[ \t]*\/\/ .*\n/gm, "")
        .replaceAll("/* @__PURE__ */ ", "");
      mkdirSync(dirname(outfile), { recursive: true });
      writeFileSync(outfile, `${header()}\n\n${code}`);
      console.log(`  ${outfile.slice(root.length + 1)}  ${(code.length / 1024).toFixed(1)}kb`);
    });
  },
};

const options = {
  entryPoints: [join(root, "src", "index.js")],
  bundle: true,
  format: "iife",
  target: "es2020",
  charset: "utf8",
  legalComments: "none",
  loader: { ".css": "text" },
  outfile,
  write: false,
  plugins: [routePlugin, cleanPlugin],
  logLevel: "warning",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
