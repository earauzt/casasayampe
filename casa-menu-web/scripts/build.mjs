import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateCiclo } from "./validate-ciclo.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "data/ciclo.json");
const dest = path.join(root, "public/ciclo.json");

const data = JSON.parse(fs.readFileSync(src, "utf8"));
const result = validateCiclo(data);
if (!result.ok) {
  console.error("No se publica un ciclo invalido:");
  result.errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log("public/ciclo.json listo");
