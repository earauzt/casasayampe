#!/usr/bin/env node
/**
 * Valida data/ciclo.json contra las hard rules de MENU-BRAIN.
 * Uso: node scripts/validate-ciclo.mjs [ruta.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EMOJI_RE =
  /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;
const MERIENDA_RE = /\bmerienda/i;
const PEOPLE = ["Emilio", "Karla", "Carlitos", "Karlita"];
const MEAL_KEYS = [
  "desayuno",
  "snack1",
  "snack2",
  "almuerzo",
  "snackTarde",
  "cena",
];

function walkStrings(value, trail, out) {
  if (typeof value === "string") {
    out.push({ path: trail, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkStrings(v, `${trail}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([k, v]) =>
      walkStrings(v, trail ? `${trail}.${k}` : k, out)
    );
  }
}

function mentions(text, name) {
  return new RegExp(name, "i").test(text);
}

function karlaAparte(text) {
  return /Karla\s+aparte/i.test(text) || /Karla:\s/i.test(text);
}

function isPlanchaOrPuente(text) {
  if (/plancha/i.test(text)) return true;
  return (
    /salm[oó]n al horno/i.test(text) ||
    /wrap de carne/i.test(text) ||
    /pollo al horno/i.test(text) ||
    /bowl de camarones/i.test(text)
  );
}

function needsKarlaAparte(text) {
  return (
    /taco/i.test(text) ||
    /pizza/i.test(text) ||
    /hamburguesa/i.test(text) ||
    /lasa[nñ]a/i.test(text) ||
    /carbonara/i.test(text) ||
    /bolo[nñ]esa/i.test(text) ||
    /apanad/i.test(text) ||
    /frit[ao]/i.test(text) ||
    /\bseco\b/i.test(text)
  );
}

export function validateCiclo(data) {
  const errors = [];
  const warnings = [];
  const strings = [];
  walkStrings(data, "", strings);

  if (!data || typeof data !== "object") {
    return { ok: false, errors: ["JSON raiz invalido"], warnings };
  }
  if (!data.meta || !data.meta.start || !data.meta.end) {
    errors.push("meta.start y meta.end son obligatorios (ISO YYYY-MM-DD)");
  }
  if (!Array.isArray(data.days) || data.days.length !== 14) {
    errors.push(`Se esperan 14 dias, hay ${data.days ? data.days.length : 0}`);
  }

  strings.forEach(({ path: p, text }) => {
    if (EMOJI_RE.test(text)) errors.push(`Emoji en ${p}`);
    if (MERIENDA_RE.test(text) && !p.startsWith("rules")) {
      errors.push(`Palabra merienda en ${p}`);
    }
  });

  const dates = [];
  (data.days || []).forEach((day, i) => {
    const loc = `days[${i}] (${day && day.label ? day.label : "?"})`;
    if (!day || !day.date || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      errors.push(`${loc}: falta date ISO`);
    } else {
      dates.push(day.date);
    }
    if (!day.meals) {
      errors.push(`${loc}: falta meals`);
      return;
    }
    MEAL_KEYS.forEach((k) => {
      if (typeof day.meals[k] !== "string") {
        errors.push(`${loc}: meals.${k} debe ser string`);
      }
    });

    const meals = day.meals || {};
    const blob = MEAL_KEYS.map((k) => meals[k] || "").join(" \n ");
    const almuerzo = meals.almuerzo || "";
    const cena = meals.cena || "";
    const desayuno = meals.desayuno || "";
    const snackTarde = meals.snackTarde || "";
    const snack1 = meals.snack1 || "";
    const snack2 = meals.snack2 || "";

    if (/camarones/i.test(blob) && mentions(blob, "Carlitos")) {
      if (!/Carlitos\s*\([^)]*NUNCA camarones/i.test(blob) && !/Carlitos[^·]*pollo/i.test(blob)) {
        errors.push(`${loc}: camarones cerca de Carlitos sin plato aparte`);
      }
    }

    if (/bolo[nñ]esa/i.test(blob) && mentions(blob, "Karla") && !/NUNCA bolo[nñ]esa/i.test(blob) && !karlaAparte(blob)) {
      errors.push(`${loc}: boloñesa a Karla`);
    }

    const bananaBreakfast = /banano|guineo|pancake[s]? de banano/i.test(desayuno);
    const bananaSnack = /batido de guineo/i.test(snackTarde) && !/NO batido de guineo/i.test(snackTarde);
    if (bananaBreakfast && bananaSnack) {
      errors.push(`${loc}: banano en desayuno y batido de guineo el mismo dia`);
    }

    if (day.school !== false) {
      if (snack1 && /toni/i.test(snack1) === false && !/^(—|-|–)?$/.test(snack1.trim())) {
        warnings.push(`${loc}: snack colegio 1 sin Toni`);
      }
    }

    [almuerzo, cena].forEach((text, idx) => {
      const mealName = idx === 0 ? "almuerzo" : "cena";
      if (!text || /^[—\-–]$/.test(text.trim())) return;
      if (/\btodos\b/i.test(text) && needsKarlaAparte(text) && !isPlanchaOrPuente(text) && !karlaAparte(text)) {
        errors.push(`${loc}: ${mealName} dice todos pero Karla deberia ir aparte`);
      }
    });

    if (/cena ligera|huevo revuelto.*cena|s[aá]ndwich.*cena/i.test(cena)) {
      errors.push(`${loc}: posible cena ligera`);
    }

    if (/pollo desmechado/i.test(desayuno + " " + snack1 + " " + snack2 + " " + snackTarde) && mentions(desayuno + snack1 + snack2 + snackTarde, "Carlitos")) {
      errors.push(`${loc}: pollo desmechado como snack o desayuno de Carlitos`);
    }
  });

  const APANADO_RE = /teque[nñ]os|empanadita|nuggets/i;
  function breadedSnackCount(daysSlice) {
    let n = 0;
    (daysSlice || []).forEach((day) => {
      ["snack1", "snack2", "snackTarde"].forEach((k) => {
        const t = (day.meals && day.meals[k]) || "";
        if (APANADO_RE.test(t)) n += 1;
      });
    });
    return n;
  }
  const week1 = (data.days || []).slice(0, 7);
  const week2 = (data.days || []).slice(7, 14);
  const b1 = breadedSnackCount(week1);
  const b2 = breadedSnackCount(week2);
  if (b1 > 4) errors.push(`Semana 1: ${b1} snacks apanados (máximo 4)`);
  if (b2 > 4) errors.push(`Semana 2: ${b2} snacks apanados (máximo 4)`);

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(`${dates[i - 1]}T00:00:00`);
    const cur = new Date(`${dates[i]}T00:00:00`);
    const diff = (cur - prev) / 86400000;
    if (diff !== 1) errors.push(`Fechas no consecutivas: ${dates[i - 1]} -> ${dates[i]}`);
  }

  const shop = data.shopping || {};
  ["mercado", "supermaxi", "limpieza"].forEach((k) => {
    if (!Array.isArray(shop[k])) errors.push(`shopping.${k} debe ser array`);
  });
  (shop.mercado || []).forEach((item, i) => {
    if (item.channel && item.channel !== "mercado") {
      errors.push(`shopping.mercado[${i}] no puede ir a Tipti`);
    }
  });
  (shop.supermaxi || []).concat(shop.limpieza || []).forEach((item, i) => {
    if (!item.name) errors.push(`item Tipti ${i} sin name`);
  });
  const manzanaMercado = (shop.mercado || []).some((item) => /manzana/i.test(item.name || ""));
  const manzanaTipti = (shop.supermaxi || []).some((item) => /manzana/i.test(item.name || ""));
  if (manzanaMercado) errors.push("Manzana roja no va al mercado: va a Tipti (calidad)");
  if (!manzanaTipti) warnings.push("Falta manzana roja en shopping.supermaxi (Tipti)");

  const cooking = data.cooking || {};
  if (!cooking.ramona || !cooking.angelica) {
    errors.push("cooking.ramona y cooking.angelica son obligatorios");
  }
  if (!data.rules || !Array.isArray(data.rules.people) || !Array.isArray(data.rules.hardRules)) {
    errors.push("rules.people y rules.hardRules son obligatorios");
  }
  PEOPLE.forEach((p) => {
    const found = (data.rules && data.rules.people || []).some((x) => x.name === p);
    if (!found) warnings.push(`Falta bloque de reglas para ${p}`);
  });

  return { ok: errors.length === 0, errors, warnings };
}

function load(file) {
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const file = process.argv[2] || path.resolve(process.cwd(), "data/ciclo.json");
  const result = validateCiclo(load(file));
  if (result.warnings.length) {
    console.log("Avisos:");
    result.warnings.forEach((w) => console.log("  - " + w));
  }
  if (!result.ok) {
    console.error("Errores:");
    result.errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }
  console.log("Ciclo valido: " + file);
}
