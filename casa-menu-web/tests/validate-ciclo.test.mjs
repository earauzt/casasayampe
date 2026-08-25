import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateCiclo } from "../scripts/validate-ciclo.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ciclo = JSON.parse(fs.readFileSync(path.join(root, "data/ciclo.json"), "utf8"));

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const good = validateCiclo(ciclo);
assert(good.ok, "ciclo vigente deberia validar:\n" + good.errors.join("\n"));

const bananaFail = structuredClone(ciclo);
bananaFail.days[1].meals.snackTarde = "Carlitos: batido de guineo + 1 scoop proteína de huevo · Karlita: tortolines";
const banana = validateCiclo(bananaFail);
assert(
  banana.errors.some((e) => /banano/i.test(e)),
  "deberia detectar banano repetido"
);

const emojiFail = structuredClone(ciclo);
emojiFail.days[0].meals.desayuno += " :) ";
emojiFail.meta.title = "Menú familiar \u{1F374}";
const emoji = validateCiclo(emojiFail);
assert(
  emoji.errors.some((e) => /Emoji/i.test(e)),
  "deberia detectar emojis"
);

const meriendaFail = structuredClone(ciclo);
meriendaFail.days[0].meals.snack1 = "Merienda: Toni";
const merienda = validateCiclo(meriendaFail);
assert(
  merienda.errors.some((e) => /merienda/i.test(e)),
  "deberia detectar merienda"
);

const karlaFail = structuredClone(ciclo);
karlaFail.days[3].meals.almuerzo = "Pollo apanado + arroz — todos";
const karla = validateCiclo(karlaFail);
assert(
  karla.errors.some((e) => /Karla/i.test(e)),
  "deberia detectar Karla en todos con apanado"
);

const shortFail = structuredClone(ciclo);
shortFail.days = shortFail.days.slice(0, 7);
const short = validateCiclo(shortFail);
assert(
  short.errors.some((e) => /14 dias/i.test(e)),
  "deberia exigir 14 dias"
);

const breadedFail = structuredClone(ciclo);
breadedFail.days.slice(0, 7).forEach((day) => {
  day.meals.snack2 = "Tequeños (ambos)";
  day.meals.snackTarde = "Carlitos: tequeños · Karlita: empanadita de queso";
});
const breaded = validateCiclo(breadedFail);
assert(
  breaded.errors.some((e) => /apanados/i.test(e)),
  "deberia detectar exceso de snacks apanados"
);

const manzanaFail = structuredClone(ciclo);
manzanaFail.shopping.supermaxi = manzanaFail.shopping.supermaxi.filter((i) => !/manzana/i.test(i.name));
manzanaFail.shopping.mercado.push({ name: "Manzana roja", qty: "10", channel: "mercado" });
const manzana = validateCiclo(manzanaFail);
assert(
  manzana.errors.some((e) => /Manzana/i.test(e)),
  "deberia exigir manzana en Tipti"
);

console.log("tests ok");
