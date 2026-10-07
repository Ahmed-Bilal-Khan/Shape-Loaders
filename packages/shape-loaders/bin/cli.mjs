#!/usr/bin/env node
// Copies loader source files into your project, so you own and can edit them.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHAPES = [
  "circle",
  "oval",
  "semicircle",
  "crescent",
  "square",
  "rectangle",
  "parallelogram",
  "diamond",
  "kite",
  "triangle",
  "polygon",
  "pentagon",
  "hexagon",
  "octagon",
  "star",
  "heart",
];
const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

const HELP = `shape-loaders — minimal SVG loaders for React

Usage
  npx shape-loaders list                 Show the available shapes
  npx shape-loaders add <shape...>       Copy shapes into your project
  npx shape-loaders add --all            Copy every shape

Options
  --dir <path>    Where to copy files (default: src/components/shape-loaders,
                  or components/shape-loaders when there is no src folder)
  --overwrite     Replace files that already exist

Example
  npx shape-loaders add circle star --dir src/ui/loaders
`;

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "help" || args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

if (command === "list") {
  console.log(SHAPES.join("\n"));
  process.exit(0);
}

if (command !== "add") {
  console.error(`Unknown command "${command}".\n\n${HELP}`);
  process.exit(1);
}

let dir;
let overwrite = false;
let all = false;
const picked = [];
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--dir") dir = args[++i];
  else if (arg === "--overwrite") overwrite = true;
  else if (arg === "--all") all = true;
  else picked.push(arg.toLowerCase());
}

const unknown = picked.filter((name) => !SHAPES.includes(name));
if (unknown.length) {
  console.error(`Unknown shape: ${unknown.join(", ")}. Available: ${SHAPES.join(", ")}.`);
  process.exit(1);
}

const shapes = all ? SHAPES : [...new Set(picked)];
if (!shapes.length) {
  console.error(`Name at least one shape, or pass --all. Available: ${SHAPES.join(", ")}.`);
  process.exit(1);
}

const target = resolve(dir ?? (existsSync("src") ? "src/components/shape-loaders" : "components/shape-loaders"));
mkdirSync(target, { recursive: true });

// core.tsx holds the animation engine every shape imports.
for (const name of ["core", ...shapes]) {
  const file = `${name}.tsx`;
  const dest = join(target, file);
  const shown = relative(process.cwd(), dest);
  if (existsSync(dest) && !overwrite) {
    console.log(`  skipped  ${shown} (already exists, pass --overwrite to replace)`);
    continue;
  }
  copyFileSync(join(SRC, file), dest);
  console.log(`  added    ${shown}`);
}

const example = shapes[0];
const component = example[0].toUpperCase() + example.slice(1);
console.log(`\nImport it from where it landed:\n  import { ${component} } from "./${relative(process.cwd(), target).replaceAll("\\", "/")}/${example}";`);
