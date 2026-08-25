(function () {
  "use strict";

  var STORE_PREFIX = "casa-menu::";
  var TABS = [
    ["hoy", "Hoy"],
    ["minuta", "Minuta"],
    ["loncheras", "Loncheras"],
    ["cocina", "Cocina"],
    ["compras", "Compras"],
    ["reglas", "Reglas"],
  ];
  var MEAL_KEYS = ["desayuno", "snack1", "snack2", "almuerzo", "snackTarde", "cena"];
  var MEAL_LABELS = {
    desayuno: "Desayuno",
    snack1: "Lonchera 1",
    snack2: "Lonchera 2",
    almuerzo: "Almuerzo",
    snackTarde: "Tarde",
    cena: "Cena",
  };
  var BOARD_LABELS = {
    desayuno: "Desayuno",
    snack1: "L1",
    snack2: "L2",
    almuerzo: "Almuerzo",
    snackTarde: "Tarde",
    cena: "Cena",
  };
  var PEOPLE = ["Emilio", "Karla", "Carlitos", "Karlita"];
  var SNACK_KEYS = { snack1: 1, snack2: 1, snackTarde: 1 };
  var COMPRAS_SECS = [
    ["mercado", "Mercado", "Fresco. Se compra aparte, no va en Tipti."],
    ["supermaxi", "Supermaxi", "Se carga en Tipti cuando Emilio valide."],
    ["limpieza", "Casa / limpieza", "Se carga en Tipti cuando Emilio valide."],
  ];
  var SHOP_LABEL = { mercado: "Mercado", supermaxi: "Supermaxi", limpieza: "Casa / limpieza" };
  var DAY_MAP = {
    Mar: "Martes",
    Mié: "Miércoles",
    Jue: "Jueves",
    Vie: "Viernes",
    Sáb: "Sábado",
    Dom: "Domingo",
    Lun: "Lunes",
  };

  function ls_get(key, fallback) {
    try {
      var v = localStorage.getItem(STORE_PREFIX + key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }
  function ls_set(key, val) {
    try {
      localStorage.setItem(STORE_PREFIX + key, JSON.stringify(val));
    } catch (e) {}
  }
  function slug(s) {
    return String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "html") e.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c) e.appendChild(c);
    });
    return e;
  }
  function txt(s) {
    return document.createTextNode(s);
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function stripMarks(s) {
    return String(s || "")
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/\*\*/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  function isEmptyMeal(text) {
    var t = String(text || "").trim();
    return !t || t === "—" || t === "-" || t === "–";
  }
  function formatDay(label) {
    var m = String(label).match(/^(Mar|Mié|Jue|Vie|Sáb|Dom|Lun)\s+(\d+)/);
    if (m && DAY_MAP[m[1]]) return DAY_MAP[m[1]] + " " + m[2];
    return label;
  }
  function formatDayShort(label) {
    var m = String(label).match(/^(Mar|Mié|Jue|Vie|Sáb|Dom|Lun)\s+(\d+)/);
    if (m) return m[1] + " " + m[2];
    return label;
  }
  function isWeekend(day) {
    if (day && day.school === false) return true;
    return /^(Sáb|Dom)\b/.test(String(day && day.label));
  }
  function todayISO() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  function daysBetween(a, b) {
    var da = new Date(a + "T00:00:00");
    var db = new Date(b + "T00:00:00");
    return Math.round((db - da) / 86400000);
  }
  function weekdayLong(iso) {
    return new Intl.DateTimeFormat("es-EC", {
      timeZone: "America/Guayaquil",
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(iso + "T12:00:00"));
  }

  function peopleFor(key, raw) {
    var t = String(raw || "");
    if (isEmptyMeal(t)) return [];
    var found = [];
    function add(p) {
      if (found.indexOf(p) < 0) found.push(p);
    }
    if (/\btodos\b/i.test(t)) {
      PEOPLE.forEach(add);
      return PEOPLE.slice();
    }
    if (/\bambos\b/i.test(t)) {
      add("Carlitos");
      add("Karlita");
    }
    PEOPLE.forEach(function (p) {
      if (new RegExp(p, "i").test(t)) add(p);
    });
    if (key === "desayuno" && /familia\s*:/i.test(t)) {
      add("Carlitos");
      add("Karlita");
      add("Karla");
      if (/Emilio/i.test(t)) add("Emilio");
    }
    if (SNACK_KEYS[key] && !found.length) {
      add("Carlitos");
      add("Karlita");
    }
    return PEOPLE.filter(function (p) {
      return found.indexOf(p) >= 0;
    });
  }

  function capFirst(s) {
    s = String(s || "").trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function plateName(s) {
    s = stripMarks(s);
    s = s.replace(/^Familia:\s*/i, "");
    s = s.replace(/^\s*Cena fuerte:\s*/i, "");
    s = s.replace(/^En casa:\s*/i, "");
    s = s.replace(/^Liviana\/sobras:\s*/i, "");
    s = s.replace(/^sobras de\s+/i, "");
    s = s.replace(/^Emilio\s*\+\s*Karla\s*→\s*/i, "");
    s = s.replace(/^\s*Reforzado Karlita:\s*/i, "");
    s = s.split(/\s+—\s+/)[0];
    s = s.split(/\s+·\s+/)[0];
    s = s.replace(/\([^)]*\)/g, " ");
    if (!/^\s*arroz\b/i.test(s)) {
      s = s.replace(/\s*[+,]\s*arroz(\s*[+,]\s*encurtidos)?.*$/i, "");
    } else {
      s = s.replace(/\s*[+,]\s*encurtidos\b.*$/i, "");
    }
    s = s.replace(/\s*encurtidos\s*$/i, "");
    s = s.replace(/\s{2,}/g, " ").trim();
    if (/fideo\s*(del\s*)?cole/i.test(s)) return "Fideo del colegio";
    if (/batido de guineo/i.test(s)) return "Batido de guineo";
    if (/tortolines/i.test(s)) return "Tortolines";
    if (/toni chocolatada/i.test(s)) return "Toni";
    if (/pan de yuca/i.test(s)) return "Pan de yuca";
    if (/s[áa]nduche de queso con huevo/i.test(s)) return "Sánduche queso y huevo";
    if (/s[áa]nduche de queso/i.test(s)) return "Sánduche de queso";
    if (/pancakes de banano/i.test(s)) return "Pancakes de banano";
    if (/huevo revuelto en tortilla/i.test(s)) return "Huevo en tortilla";
    if (/tostadas francesas/i.test(s)) return "Tostadas francesas";
    if (/\bwaffles\b/i.test(s)) return "Waffles";
    if (/manzana roja.*queso/i.test(s)) return "Manzana y queso";
    if (/manzana roja/i.test(s)) return "Manzana roja";
    if (/galletas amor/i.test(s)) return "Galletas Amor";
    if (/galletas de coco/i.test(s)) return "Galletas de coco";
    if (/empanadita/i.test(s)) return "Empanadita";
    if (/\bnuggets\b/i.test(s)) return "Nuggets";
    if (/tequeños/i.test(s)) return "Tequeños";
    if (/quesadilla/i.test(s)) return "Quesadilla";
    if (/sanduch[oó]n de at[uú]n/i.test(s)) return "Sanduchón de atún";
    if (/sanduch[oó]n de pollo/i.test(s)) return "Sanduchón de pollo";
    if (/hot dog/i.test(s)) return "Hot dog";
    if (/patac[oó]n/i.test(s)) return "Patacón con huevo";
    if (/pan tostado/i.test(s)) return "Pan y huevo";
    if (/tortilla de fideos/i.test(s)) return "Tortilla de fideos";
    if (/fideos carbonara/i.test(s)) return "Carbonara";
    if (/fideos boloñesa/i.test(s)) return "Boloñesa";
    if (/fideos con carne/i.test(s)) return "Fideos con carne";
    if (/arroz con pollo/i.test(s)) return "Arroz con pollo";
    return capFirst(s);
  }

  function parseMeal(key, raw) {
    var t = stripMarks(raw);
    var out = { title: "", note: "", flag: "" };
    var tryM = t.match(/Para probar:\s*(.+)$/i);
    if (tryM) {
      var tryDish = plateName(tryM[1].split("(")[0]);
      out.note = "Probar: " + (tryDish || "porción chica");
    }

    if (key === "desayuno") {
      var fam = t.replace(/^Familia:\s*/i, "").split(/\s*·\s*/)[0];
      if (/tigrillo/i.test(fam)) {
        out.title = "Tigrillo";
        out.note = /tostadas/i.test(fam) ? "Karlita: tostadas" : "Karlita: pancakes";
      } else {
        out.title = plateName(fam);
      }
      var em = t.match(/Emilio:\s*(Batido\s*[12])/i);
      if (em) out.note = (out.note ? out.note + " · " : "") + "Emilio: " + em[1];
      return out;
    }
    if (key === "snack1") {
      var items = parseLoncheraItems(t);
      out.title = items.map(plateName).join(" · ") || plateName(t);
      return out;
    }
    if (key === "snack2") {
      out.title = plateName(t.replace(/\s*\([^)]*\)/g, " "));
      return out;
    }
    if (key === "snackTarde") {
      var parts = t.split(/\s*·\s*/).map(function (part) {
        var who = "";
        var m = part.match(/^(Carlitos|Karlita):\s*/i);
        if (m) {
          who = m[1];
          part = part.slice(m[0].length);
        }
        part = part.replace(/\(NO batido[^)]*\)/gi, "");
        part = part.replace(/^\s*Reforzado Karlita:\s*/i, "");
        var dish = plateName(part);
        if (/quesadilla\s*\+/i.test(part)) dish = plateName(part.split("+")[0]) + " + extra";
        return who ? who + ": " + dish : dish;
      });
      out.title = parts.join(" · ");
      return out;
    }

    if (/fideo\s*(del\s*)?cole/i.test(t)) {
      out.title = "Fideo del colegio";
      var casa = t.match(/En casa:\s*(.+)$/i);
      if (casa) {
        var casaPlate = plateName(casa[1].replace(/Emilio\s*\+\s*Karla\s*→\s*/i, ""));
        out.note = "Casa: " + casaPlate;
      }
      return out;
    }

    if (/\bpizza\b/i.test(t)) {
      out.title = "Pizza casera";
      out.note = "Emilio: queso + proteína · Karla: aparte";
      return out;
    }
    if (/\bparrillada\b/i.test(t)) {
      out.title = /sobra/i.test(t) ? "Sobras de parrilla" : "Parrillada";
      return out;
    }
    if (/\btacos\b/i.test(t)) {
      out.title = "Tacos";
      out.note = "Emilio: plancha · Karla: wrap";
      return out;
    }
    if (/hamburguesa/i.test(t) && /patty|sin pan/i.test(t)) {
      out.title = "Hamburguesa";
      out.note = "Emilio: sin pan · Karla: pollo";
      return out;
    }
    if (/lasaña/i.test(t)) {
      out.title = "Lasaña";
      out.note = "Emilio: sin pasta · Karla: plancha";
      return out;
    }
    if (/liviana\/sobras/i.test(t)) {
      out.title = "Sobras: " + plateName(t.replace(/^[^:]+:\s*/i, ""));
    } else {
      out.title = plateName(t);
    }
    var notes = [];
    var karla = t.match(/Karla\s+aparte:\s*([^·]+)/i) || t.match(/Karla:\s*([^·]+)/i);
    if (karla && /plancha/i.test(karla[1])) notes.push("Karla: plancha");
    else if (karla && /wrap/i.test(karla[1])) notes.push("Karla: wrap");
    else if (karla && /hamburguesa de pollo/i.test(karla[1])) notes.push("Karla: pollo");
    else if (karla) notes.push("Karla: " + plateName(karla[1]));
    if (/Karlita:.*reducid/i.test(t) || /Karlita: porción reducida/i.test(t)) notes.push("Karlita: ración niña");
    if (/NUNCA camarones/i.test(t) || /Carlitos[^·]*pollo seco/i.test(t)) notes.push("Carlitos: pollo");
    if (/SIN pasta|sin pasta/i.test(t)) notes.push("Emilio: sin pasta");
    if (/hamburguesa/i.test(t) && /SIN pan|sin pan/i.test(t)) notes.push("Emilio: sin pan");
    if (/NUNCA boloñesa/i.test(t)) notes.push("Karla: plancha");
    out.note = notes.join(" · ");
    return out;
  }

  function parseDish(key, raw) {
    return parseMeal(key, raw);
  }

  function fillMeal(td, key, raw) {
    if (isEmptyMeal(raw)) {
      td.appendChild(el("div", { class: "dish-title" }, [txt("—")]));
      return;
    }
    var parsed = parseMeal(key, raw);
    var titleEl = el("div", { class: "dish-title" }, [txt(parsed.title || plateName(raw))]);
    if (parsed.flag) titleEl.appendChild(el("span", { class: "stamp" }, [txt(parsed.flag)]));
    td.appendChild(titleEl);
    if (parsed.note) td.appendChild(el("div", { class: "dish-note" }, [txt(parsed.note)]));
  }

  function parseLoncheraItems(raw) {
    return stripMarks(raw)
      .split(/\s+\+\s+/)
      .map(function (p) {
        return p.replace(/\s*\([^)]*\)\s*$/, "").trim();
      })
      .filter(Boolean);
  }

  function findDay(data, iso) {
    return (data.days || []).filter(function (d) {
      return d.date === iso;
    })[0];
  }

  function cookingFor(data, cookKey, day) {
    var block = (data.cooking && data.cooking[cookKey]) || {};
    var dishes = block.dishes || [];
    if (!day) return dishes;
    var n = String(Number(String(day.date).slice(8)));
    var re = new RegExp("(^|[^0-9])" + n + "([^0-9]|$)");
    return dishes.filter(function (d) {
      if (!d.dates) return true;
      if (!/\d/.test(d.dates)) return true;
      return re.test(d.dates);
    });
  }

  function mountError(msg) {
    var app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(el("div", { class: "sheet" }, [el("p", { class: "err" }, [txt(msg)])]));
  }

  function start(DATA) {
    var app = document.getElementById("app");
    app.innerHTML = "";
    var sheet = el("div", { class: "sheet" });
    app.appendChild(sheet);

    var mast = el("header", { class: "mast" });
    mast.appendChild(el("h1", { class: "word-minuta" }, [txt((DATA.meta && DATA.meta.family) || "Casa Arauz")]));
    mast.appendChild(el("p", { class: "range" }, [txt((DATA.meta && DATA.meta.range) || "")]));
    sheet.appendChild(mast);

    var sticky = el("div", { class: "sticky-nav" });
    var nav = el("nav", { class: "row", role: "navigation", "aria-label": "Secciones" });
    TABS.forEach(function (t) {
      nav.appendChild(
        el(
          "button",
          {
            type: "button",
            "data-key": t[0],
            onclick: function () {
              location.hash = t[0];
            },
          },
          [txt(t[1])]
        )
      );
    });
    sticky.appendChild(nav);
    sheet.appendChild(sticky);

    var main = el("main", { id: "contenido" });
    sheet.appendChild(main);
    var panels = {};
    function makePanel(key) {
      var p = el("div", { class: "panel", id: "panel-" + key, role: "tabpanel" });
      panels[key] = p;
      main.appendChild(p);
      return p;
    }

    var today = todayISO();
    var startDate = DATA.meta && DATA.meta.start;
    var endDate = DATA.meta && DATA.meta.end;
    var todayDay = findDay(DATA, today);

    function selectTab(key) {
      if (!panels[key]) key = "minuta";
      Array.prototype.forEach.call(nav.querySelectorAll("button"), function (btn) {
        var on = btn.getAttribute("data-key") === key;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-current", on ? "page" : "false");
      });
      Object.keys(panels).forEach(function (k) {
        panels[k].classList.toggle("active", k === key);
      });
    }

    function mealRow(key, raw, personFilter) {
      var who = peopleFor(key, raw);
      if (personFilter && who.length && who.indexOf(personFilter) < 0) return null;
      var empty = isEmptyMeal(raw);
      if (empty && SNACK_KEYS[key]) return null;
      var row = el("div", { class: "meal-row" });
      row.appendChild(el("div", { class: "meal-k" }, [txt(MEAL_LABELS[key])]));
      var val = el("div", { class: "meal-v" });
      fillMeal(val, key, raw);
      row.appendChild(val);
      return row;
    }

    function mealBlock(key, raw, personFilter) {
      return mealRow(key, raw, personFilter);
    }

    function buildHoy() {
      var panel = makePanel("hoy");
      var status = el("div", { class: "hoy-status" });
      var day = todayDay;
      if (!startDate || !endDate) {
        status.appendChild(el("p", {}, [txt("Este ciclo no tiene fechas ISO.")]));
        panel.appendChild(status);
        return;
      }
      if (today < startDate) {
        var n = daysBetween(today, startDate);
        status.appendChild(
          el("p", {}, [
            txt(weekdayLong(today) + ". El ciclo abre el " + weekdayLong(startDate) + "."),
          ])
        );
        status.appendChild(el("p", {}, [el("strong", {}, [txt(n === 1 ? "Falta 1 día." : "Faltan " + n + " días.")])]));
        day = DATA.days[0];
      } else if (today > endDate) {
        status.appendChild(
          el("p", {}, [txt("Este ciclo cerró el " + weekdayLong(endDate) + ".")])
        );
        panel.appendChild(status);
        return;
      } else {
        status.appendChild(el("p", {}, [el("strong", {}, [txt(formatDay(day.label))])]));
        if (day.note) status.appendChild(el("p", { class: "day-note" }, [txt(day.note)]));
      }
      panel.appendChild(status);

      var grid = el("div", { class: "hoy-grid" });
      var angel = el("section", { class: "hoy-card" });
      angel.appendChild(el("h2", {}, [txt("Angélica")]));
      ["desayuno", "snack1", "snack2", "snackTarde"].forEach(function (k) {
        if (isWeekend(day) && (k === "snack1" || k === "snack2")) return;
        var block = mealRow(k, day.meals && day.meals[k]);
        if (block) angel.appendChild(block);
      });
      var ramona = el("section", { class: "hoy-card" });
      ramona.appendChild(el("h2", {}, [txt("Ramona")]));
      ["almuerzo", "cena"].forEach(function (k) {
        var block = mealRow(k, day.meals && day.meals[k]);
        if (block) ramona.appendChild(block);
      });
      grid.appendChild(angel);
      grid.appendChild(ramona);
      panel.appendChild(grid);
    }

    function buildMinuta() {
      var panel = makePanel("minuta");
      var days = DATA.days || [];
      var weeks = [days.slice(0, 7), days.slice(7, 14)];
      var personFilter = ls_get("person", "");
      var switcher = el("div", { class: "week-switch", role: "tablist", "aria-label": "Semana" });
      var chips = el("div", { class: "chip-row", "aria-label": "Persona" });
      var list = el("div", {});
      panel.appendChild(switcher);
      panel.appendChild(chips);
      panel.appendChild(list);
      var labels = ["1–7 sep", "8–14 sep"];
      if (DATA.meta && DATA.meta.start && DATA.meta.end) {
        labels = [
          DATA.meta.start.slice(8) + "–" + days[6].date.slice(8),
          days[7].date.slice(8) + "–" + DATA.meta.end.slice(8),
        ];
      }
      var weekIdx = todayDay && days.indexOf(todayDay) >= 7 ? 1 : 0;

      function renderWeek(idx) {
        list.innerHTML = "";
        var weekDays = weeks[idx] || [];

        var board = el("div", { class: "week-board" });
        board.appendChild(el("div", { class: "wb-cell wb-corner" }, [txt("")]));
        weekDays.forEach(function (day) {
          var head = el("div", { class: "wb-cell wb-head" + (day.date === today ? " today" : "") });
          head.appendChild(txt(formatDayShort(day.label)));
          board.appendChild(head);
        });
        MEAL_KEYS.forEach(function (key) {
          var any = weekDays.some(function (day) {
            var text = (day.meals && day.meals[key]) || "";
            return !(isEmptyMeal(text) && SNACK_KEYS[key]);
          });
          if (!any) return;
          board.appendChild(el("div", { class: "wb-cell wb-label" }, [txt(BOARD_LABELS[key] || MEAL_LABELS[key])]));
          weekDays.forEach(function (day) {
            var text = (day.meals && day.meals[key]) || "";
            var empty = isEmptyMeal(text);
            var who = peopleFor(key, text);
            var dim = personFilter && who.length && who.indexOf(personFilter) < 0;
            var cell = el("div", {
              class: "wb-cell" + (dim ? " dim" : "") + (day.date === today ? " today" : ""),
            });
            if (empty && SNACK_KEYS[key]) {
              cell.appendChild(el("div", { class: "dish-title muted" }, [txt("—")]));
            } else {
              fillMeal(cell, key, text);
            }
            board.appendChild(cell);
          });
        });
        list.appendChild(board);

        var stack = el("div", { class: "week-list" });
        weekDays.forEach(function (day) {
          var band = el("section", { class: "day-band" + (day.date === today ? " today" : "") });
          var h = el("h2", { class: "day-name" }, [txt(formatDay(day.label))]);
          if (day.date === today) h.appendChild(el("span", { class: "today-mark" }, [txt("Hoy")]));
          band.appendChild(h);
          if (day.note) band.appendChild(el("p", { class: "day-note" }, [txt(day.note)]));
          MEAL_KEYS.forEach(function (key) {
            var text = (day.meals && day.meals[key]) || "";
            var empty = isEmptyMeal(text);
            if (empty && SNACK_KEYS[key]) return;
            var who = peopleFor(key, text);
            var dim = personFilter && who.length && who.indexOf(personFilter) < 0;
            var row = mealRow(key, text);
            if (!row) return;
            if (dim) row.className += " dim";
            band.appendChild(row);
          });
          stack.appendChild(band);
        });
        list.appendChild(stack);
      }

      weeks.forEach(function (w, idx) {
        if (!w.length) return;
        var btn = el(
          "button",
          {
            type: "button",
            class: idx === weekIdx ? "active" : "",
            "aria-pressed": idx === weekIdx ? "true" : "false",
            onclick: function () {
              Array.prototype.forEach.call(switcher.children, function (b) {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
              });
              btn.classList.add("active");
              btn.setAttribute("aria-pressed", "true");
              weekIdx = idx;
              renderWeek(idx);
            },
          },
          [txt(labels[idx])]
        );
        switcher.appendChild(btn);
      });

      ["", "Emilio", "Karla", "Carlitos", "Karlita"].forEach(function (p) {
        var label = p || "Todos";
        var btn = el(
          "button",
          {
            type: "button",
            class: "chip" + (personFilter === p ? " active" : ""),
            "aria-pressed": personFilter === p ? "true" : "false",
            onclick: function () {
              personFilter = p;
              ls_set("person", p);
              Array.prototype.forEach.call(chips.children, function (b) {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
              });
              btn.classList.add("active");
              btn.setAttribute("aria-pressed", "true");
              renderWeek(weekIdx);
            },
          },
          [txt(label)]
        );
        chips.appendChild(btn);
      });
      renderWeek(weekIdx);
    }

    function packKey(date, part) {
      return "pack:" + date + ":" + part;
    }

    function packRow(date, part, title, hint, hintClass) {
      var key = packKey(date, part);
      var checked = !!ls_get(key, false);
      var cid = "p-" + slug(date + "-" + part);
      var row = el("div", { class: "pack-row" });
      var cb = el("input", {
        type: "checkbox",
        id: cid,
        onchange: function () {
          ls_set(key, cb.checked);
        },
      });
      cb.checked = checked;
      row.appendChild(cb);
      var box = el("div", { class: "pack-copy" });
      var lab = el("label", { for: cid, class: "lonch-item" }, [txt(title)]);
      if (hint) lab.appendChild(el("span", { class: "lonch-hint" + (hintClass ? " " + hintClass : "") }, [txt(" · " + hint)]));
      box.appendChild(lab);
      row.appendChild(box);
      return row;
    }

    function buildLoncheras() {
      var panel = makePanel("loncheras");
      panel.appendChild(
        el("p", { class: "lede" }, [txt("Toni todos los días de cole. Marca lo que ya está en la lonchera.")])
      );
      (DATA.days || []).forEach(function (day) {
        if (isWeekend(day)) return;
        var snack1 = (day.meals && day.meals.snack1) || "";
        var snack2 = (day.meals && day.meals.snack2) || "";
        if (isEmptyMeal(snack1) && isEmptyMeal(snack2)) return;
        var sec = el("section", { class: "lonch-day" + (day.date === today ? " today" : "") });
        var h = el("h2", { class: "day-name" }, [txt(formatDay(day.label))]);
        if (day.date === today) h.appendChild(el("span", { class: "today-mark" }, [txt("Hoy")]));
        sec.appendChild(h);
        if (day.note) sec.appendChild(el("p", { class: "day-note" }, [txt(day.note)]));
        if (!isEmptyMeal(snack1)) {
          var b1 = el("div", { class: "lonch-block" });
          b1.appendChild(el("p", { class: "lonch-label" }, [txt("Lonchera 1")]));
          var items = parseLoncheraItems(snack1);
          if (!items.length) b1.appendChild(packRow(day.date, "s1", plateName(snack1), ""));
          items.forEach(function (item, i) {
            var hint = /toni/i.test(item) ? "ambos" : /pan de yuca/i.test(item) ? "solo Carlitos" : "Karlita";
            var hintClass = /toni/i.test(item) ? "" : "adobe";
            b1.appendChild(packRow(day.date, "s1-" + i, plateName(item), hint, hintClass));
          });
          sec.appendChild(b1);
        }
        if (!isEmptyMeal(snack2)) {
          var b2 = el("div", { class: "lonch-block" });
          b2.appendChild(el("p", { class: "lonch-label" }, [txt("Lonchera 2")]));
          b2.appendChild(packRow(day.date, "s2", plateName(snack2), "ambos"));
          sec.appendChild(b2);
        }
        panel.appendChild(sec);
      });
    }

    function buildCocina() {
      var panel = makePanel("cocina");
      var cooking = DATA.cooking || {};
      var cookFilter = ls_get("cook", "");
      var chips = el("div", { class: "chip-row", "aria-label": "Cocina" });
      panel.appendChild(chips);
      var body = el("div", {});
      panel.appendChild(body);

      function render() {
        body.innerHTML = "";
        [
          ["ramona", "Ramona"],
          ["angelica", "Angélica"],
        ].forEach(function (pair) {
          if (cookFilter && cookFilter !== pair[0]) return;
          var block = cooking[pair[0]] || {};
          var sec = el("section", { class: "cook-person" });
          sec.appendChild(el("h2", { class: "cook-name" }, [txt(pair[1])]));
          if (block.intro) {
            var intro = el("details", { class: "cook-intro-box" });
            intro.appendChild(el("summary", {}, [txt("Fijo de " + pair[1])]));
            intro.appendChild(el("p", { class: "cook-intro" }, [txt(block.intro)]));
            sec.appendChild(intro);
          }
          (block.dishes || []).forEach(function (d) {
            var dish = el("details", { class: "cook-dish" });
            var sum = el("summary", {});
            if (d.name) sum.appendChild(el("span", { class: "cook-dish-name" }, [txt(d.name)]));
            if (d.dates) sum.appendChild(el("span", { class: "cook-dates" }, [txt(d.dates)]));
            dish.appendChild(sum);
            if (d.text) dish.appendChild(el("p", { class: "cook-text" }, [txt(d.text)]));
            sec.appendChild(dish);
          });
          body.appendChild(sec);
        });
      }

      [
        ["", "Las dos"],
        ["ramona", "Ramona"],
        ["angelica", "Angélica"],
      ].forEach(function (p) {
        var btn = el(
          "button",
          {
            type: "button",
            class: "chip" + (cookFilter === p[0] ? " active" : ""),
            "aria-pressed": cookFilter === p[0] ? "true" : "false",
            onclick: function () {
              cookFilter = p[0];
              ls_set("cook", p[0]);
              Array.prototype.forEach.call(chips.children, function (b) {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
              });
              btn.classList.add("active");
              btn.setAttribute("aria-pressed", "true");
              render();
            },
          },
          [txt(p[1])]
        );
        chips.appendChild(btn);
      });
      render();
    }

    function catProgress(key) {
      var required = (DATA.shopping && DATA.shopping[key]) || [];
      var wishlist = ls_get("wishlist:" + key, []);
      var total = required.length + wishlist.length,
        done = 0;
      required.forEach(function (item) {
        if (ls_get("check:" + key + ":" + slug(item.name), false)) done++;
      });
      wishlist.forEach(function (_, idx) {
        if (ls_get("checkwish:" + key + ":" + idx, false)) done++;
      });
      return { total: total, done: done };
    }
    function progressPhrase(key) {
      var p = catProgress(key);
      var left = p.total - p.done;
      var name = SHOP_LABEL[key] || key;
      if (!p.total) return "Nada en " + name;
      if (left === 0) return name + " listo";
      if (left === 1) return "Falta 1 en " + name;
      return "Faltan " + left + " en " + name;
    }

    function buildCompras() {
      var panel = makePanel("compras");
      var head = el("div", { class: "compras-head" });
      head.appendChild(el("h2", { class: "compras-title" }, [txt("Lista de 14 días")]));
      head.appendChild(
        el("p", { class: "tipti-line" }, [
          txt("Emilio valida. Supermaxi y limpieza van a Tipti. Mercado no. Él paga. Sin checkout."),
        ])
      );
      panel.appendChild(head);

      var validated = !!ls_get("validated", false);
      var validateRow = el("div", { class: "validate-row" });
      var valBtn = el(
        "button",
        { type: "button", class: "btn-adobe", "aria-pressed": validated ? "true" : "false" },
        [txt("Ya revisé la lista")]
      );
      var valMsg = el("p", { class: "validated-msg" });
      function paintValidated() {
        valBtn.setAttribute("aria-pressed", validated ? "true" : "false");
        valMsg.textContent = validated
          ? "Lista lista para Tipti. Supermaxi y limpieza entran al carrito. Mercado no. Emilio paga."
          : "";
        valMsg.hidden = !validated;
      }
      valBtn.addEventListener("click", function () {
        validated = !validated;
        ls_set("validated", validated);
        paintValidated();
      });
      validateRow.appendChild(valBtn);
      validateRow.appendChild(valMsg);
      paintValidated();
      panel.appendChild(validateRow);

      var currentFilter = "pendientes";
      var channelFilter = "todo";
      var toolbar = el("div", { class: "toolbar" });
      var filterGroup = el("div", { class: "filter-pair" });
      var channelGroup = el("div", { class: "filter-pair" });
      toolbar.appendChild(filterGroup);
      toolbar.appendChild(channelGroup);
      panel.appendChild(toolbar);

      var bodies = {};
      var sections = {};
      var copyAllBtn = el("button", { type: "button", class: "copy-btn" }, [txt("Copiar pendientes")]);
      var copyTiptiBtn = el("button", { type: "button", class: "copy-btn" }, [txt("Copiar Tipti")]);
      toolbar.appendChild(copyAllBtn);
      toolbar.appendChild(copyTiptiBtn);

      function isChecked(key, kind, ref) {
        return kind === "req"
          ? !!ls_get("check:" + key + ":" + slug(ref.name), false)
          : !!ls_get("checkwish:" + key + ":" + ref, false);
      }

      function pendingLines(tiptiOnly) {
        var lines = [];
        COMPRAS_SECS.forEach(function (sec) {
          var key = sec[0];
          if (tiptiOnly && key === "mercado") return;
          var required = (DATA.shopping && DATA.shopping[key]) || [];
          var wishlist = ls_get("wishlist:" + key, []);
          var chunk = [];
          required.forEach(function (item) {
            if (!isChecked(key, "req", item)) {
              var line = item.name + (item.qty ? " — " + item.qty : "");
              if (item.brand) line += " — " + item.brand;
              if (tiptiOnly && item.tipti) line += " — buscar: " + item.tipti;
              chunk.push(line);
            }
          });
          wishlist.forEach(function (item, idx) {
            if (!isChecked(key, "wish", idx)) chunk.push(item);
          });
          if (chunk.length) {
            lines.push(sec[1]);
            lines = lines.concat(chunk);
            lines.push("");
          }
        });
        return lines.join("\n").trim();
      }

      function copyText(btn, text, restore) {
        var done = function () {
          btn.textContent = "Copiado";
          setTimeout(function () {
            btn.textContent = restore;
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {
            try {
              var ta = document.createElement("textarea");
              ta.value = text;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
            } catch (e) {}
            done();
          });
        } else done();
      }
      copyAllBtn.addEventListener("click", function () {
        copyText(copyAllBtn, pendingLines(false), "Copiar pendientes");
      });
      copyTiptiBtn.addEventListener("click", function () {
        copyText(copyTiptiBtn, pendingLines(true), "Copiar Tipti");
      });

      function showSec(key) {
        if (channelFilter === "todo") return true;
        if (channelFilter === "tipti") return key !== "mercado";
        return key === "mercado";
      }

      function renderAll() {
        COMPRAS_SECS.forEach(function (sec) {
          sections[sec[0]].hidden = !showSec(sec[0]);
          renderSec(sec[0]);
        });
      }

      [
        ["pendientes", "Pendientes"],
        ["todo", "Todo"],
      ].forEach(function (f) {
        filterGroup.appendChild(
          el(
            "button",
            {
              type: "button",
              class: currentFilter === f[0] ? "active" : "",
              "aria-pressed": currentFilter === f[0] ? "true" : "false",
              onclick: function () {
                currentFilter = f[0];
                Array.prototype.forEach.call(filterGroup.children, function (b, i) {
                  var on = (i === 0 && currentFilter === "pendientes") || (i === 1 && currentFilter === "todo");
                  b.classList.toggle("active", on);
                  b.setAttribute("aria-pressed", on ? "true" : "false");
                });
                renderAll();
              },
            },
            [txt(f[1])]
          )
        );
      });
      [
        ["todo", "Todo canal"],
        ["tipti", "Tipti"],
        ["mercado", "Mercado"],
      ].forEach(function (f) {
        channelGroup.appendChild(
          el(
            "button",
            {
              type: "button",
              class: channelFilter === f[0] ? "active" : "",
              "data-channel": f[0],
              "aria-pressed": channelFilter === f[0] ? "true" : "false",
              onclick: function (ev) {
                channelFilter = f[0];
                Array.prototype.forEach.call(channelGroup.children, function (b) {
                  var on = b.getAttribute("data-channel") === channelFilter;
                  b.classList.toggle("active", on);
                  b.setAttribute("aria-pressed", on ? "true" : "false");
                });
                renderAll();
              },
            },
            [txt(f[1])]
          )
        );
      });

      function renderSec(key) {
        var wrap = bodies[key];
        wrap.innerHTML = "";
        var required = (DATA.shopping && DATA.shopping[key]) || [];
        var wishlist = ls_get("wishlist:" + key, []);
        wrap.appendChild(el("p", { class: "progress-words" }, [txt(progressPhrase(key))]));
        var list = el("ul", { class: "checklist" });
        wrap.appendChild(list);
        var visibleReq = required.filter(function (item) {
          return currentFilter === "todo" || !isChecked(key, "req", item);
        });
        var visibleWish = wishlist
          .map(function (v, i) {
            return { v: v, i: i };
          })
          .filter(function (o) {
            return currentFilter === "todo" || !isChecked(key, "wish", o.i);
          });
        var hiddenDone = required.length + wishlist.length - (visibleReq.length + visibleWish.length);
        if (!visibleReq.length && !visibleWish.length) {
          var msg =
            required.length + wishlist.length
              ? "Ya marcaste todo como comprado."
              : "Nada en esta categoría por ahora.";
          list.appendChild(el("li", {}, [el("span", { class: "empty" }, [txt(msg)])]));
        }
        visibleReq.forEach(function (item) {
          var ckey = "check:" + key + ":" + slug(item.name);
          var checked = ls_get(ckey, false);
          var cid = "c-" + slug(key + "-" + item.name);
          var cb = el("input", {
            type: "checkbox",
            id: cid,
            onchange: function () {
              ls_set(ckey, cb.checked);
              li.classList.toggle("checked", cb.checked);
              if (currentFilter === "pendientes" && cb.checked) renderSec(key);
              else {
                var pw = wrap.querySelector(".progress-words");
                if (pw) pw.textContent = progressPhrase(key);
              }
            },
          });
          cb.checked = !!checked;
          var html = esc(item.name);
          if (item.qty) html += ' <span class="qty">— ' + esc(item.qty) + "</span>";
          if (item.brand) html += '<span class="brand">' + esc(item.brand) + (item.tipti ? " · " + esc(item.tipti) : "") + "</span>";
          var li = el("li", { class: checked ? "checked" : "" }, [cb, el("label", { for: cid, html: html })]);
          list.appendChild(li);
        });
        visibleWish.forEach(function (o) {
          var idx = o.i,
            item = o.v;
          var ckey = "checkwish:" + key + ":" + idx;
          var checked = ls_get(ckey, false);
          var cid = "w-" + key + "-" + idx;
          var cb = el("input", {
            type: "checkbox",
            id: cid,
            onchange: function () {
              ls_set(ckey, cb.checked);
              li.classList.toggle("checked", cb.checked);
              if (currentFilter === "pendientes" && cb.checked) renderSec(key);
              else {
                var pw = wrap.querySelector(".progress-words");
                if (pw) pw.textContent = progressPhrase(key);
              }
            },
          });
          cb.checked = !!checked;
          var delBtn = el(
            "button",
            {
              type: "button",
              class: "del-btn",
              onclick: function () {
                var wl = ls_get("wishlist:" + key, []);
                wl.splice(idx, 1);
                ls_set("wishlist:" + key, wl);
                renderSec(key);
              },
            },
            [txt("Quitar")]
          );
          var li = el("li", { class: checked ? "checked" : "" }, [
            cb,
            el("label", { for: cid, html: esc(item) + ' <span class="extra-word">extra</span>' }),
            delBtn,
          ]);
          list.appendChild(li);
        });
        if (currentFilter === "pendientes" && hiddenDone > 0) {
          list.appendChild(
            el("li", {}, [
              el("span", { class: "empty" }, [
                txt(
                  hiddenDone === 1
                    ? "1 ya comprado, oculto. Toca Todo para verlo."
                    : hiddenDone + " ya comprados, ocultos. Toca Todo para verlos."
                ),
              ]),
            ])
          );
        }
        var addRow = el("div", { class: "add-row" });
        var input = el("input", { type: "text", placeholder: "Agregar algo extra a esta lista" });
        input.setAttribute("aria-label", "Agregar extra a " + (SHOP_LABEL[key] || key));
        var addBtn = el(
          "button",
          {
            type: "button",
            onclick: function () {
              var v = input.value.trim();
              if (!v) return;
              var wl = ls_get("wishlist:" + key, []);
              wl.push(v);
              ls_set("wishlist:" + key, wl);
              input.value = "";
              renderSec(key);
            },
          },
          [txt("Agregar")]
        );
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") addBtn.click();
        });
        addRow.appendChild(input);
        addRow.appendChild(addBtn);
        wrap.appendChild(addRow);
      }

      COMPRAS_SECS.forEach(function (sec) {
        var box = el("section", { class: "shop-sec" });
        box.appendChild(el("h2", {}, [txt(sec[1])]));
        box.appendChild(el("p", { class: "shop-sub" }, [txt(sec[2])]));
        var body = el("div", {});
        bodies[sec[0]] = body;
        sections[sec[0]] = box;
        box.appendChild(body);
        panel.appendChild(box);
      });
      renderAll();
    }

    function buildReglas() {
      var panel = makePanel("reglas");
      if (!DATA.rules) {
        panel.appendChild(el("p", { class: "empty" }, [txt("Sin reglas.")]));
        return;
      }
      panel.appendChild(el("p", { class: "sec-kicker" }, [txt("Por persona")]));
      (DATA.rules.people || []).forEach(function (p) {
        if (!p.rules || !p.rules.length) return;
        var card = el("section", { class: "rules-block" }, [el("h3", {}, [txt(p.name)])]);
        var ul = el("ul", {});
        p.rules.forEach(function (r) {
          ul.appendChild(el("li", {}, [txt(stripMarks(r))]));
        });
        card.appendChild(ul);
        panel.appendChild(card);
      });
      if (DATA.rules.hardRules && DATA.rules.hardRules.length) {
        panel.appendChild(el("p", { class: "sec-kicker" }, [txt("Nunca hacer")]));
        var card2 = el("section", { class: "rules-block" });
        var ul2 = el("ul", {});
        DATA.rules.hardRules.forEach(function (r) {
          ul2.appendChild(el("li", {}, [txt(stripMarks(r))]));
        });
        card2.appendChild(ul2);
        panel.appendChild(card2);
      }
    }

    buildHoy();
    buildMinuta();
    buildLoncheras();
    buildCocina();
    buildCompras();
    buildReglas();

    function applyHash() {
      var key = (location.hash || "").replace(/^#/, "");
      if (!key || !panels[key]) key = todayDay ? "hoy" : "hoy";
      selectTab(key);
    }
    window.addEventListener("hashchange", applyHash);
    applyHash();

    var footBits = ["Casa Arauz"];
    if (DATA.meta && DATA.meta.range) footBits.push("ciclo " + DATA.meta.range);
    if (DATA.meta && DATA.meta.generated) footBits.push("generado " + DATA.meta.generated);
    sheet.appendChild(el("footer", { class: "foot" }, [txt(footBits.join(" · "))]));
  }

  function boot() {
    fetch("ciclo.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("ciclo.json " + r.status);
        return r.json();
      })
      .then(start)
      .catch(function () {
        mountError("No se pudo cargar la minuta. Revisa public/ciclo.json o corre npm run build.");
      });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
  boot();
})();
