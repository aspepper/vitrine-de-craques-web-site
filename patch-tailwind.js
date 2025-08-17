// patch-tailwind.js
import { readFileSync, writeFileSync } from "fs";

const path = "./tailwind.config.ts";
let s = readFileSync(path, "utf8");

// Conserta todas as ocorrências de hsl(var(--…)) -> var(--…)
s = s.replace(/hsl\(\s*var\(--([^)]+)\)\s*\)/g, "var(--$1)");

writeFileSync(path, s, "utf8");
console.log("✅ tailwind.config.ts patch aplicado.");
