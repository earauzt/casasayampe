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
    snack1: "Snack colegio 1",
    snack2: "Snack colegio 2",
    almuerzo: "Almuerzo",
    snackTarde: "Snack de tarde",
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

  function parseDish(key, raw) {
    var t = stripMarks(raw);
    t = t.replace(/^Familia:\s*/i, "");
    t = t.replace(/\s*[+,]\s*encurtidos\s*\(Emilio\)/gi, "");
    t = t.replace(/\s*encurtidos\s*\(Emilio\)/gi, "");
    t = t.replace(/\s{2,}/g, " ").replace(/\s+\)/g, ")").trim();
    var tryItem = "";
    var tm = t.match(/Para probar:\s*(.+?)(?:\s*\(|$)/i);
    if (tm) tryItem = tm[1].replace(/\.$/, "").trim();
    var paraProbar = /para probar/i.test(t);
    if (key === "desayuno") t = t.replace(/\s*·\s*Emilio:[^·]*/gi, "").trim();
    t = t.replace(/^\s*Cena fuerte:\s*/i, "");
    var idx = t.indexOf(" — ");
    var title = t;
    if (idx !== -1) {
      var after = t.slice(idx + 3).trim();
      if (/^(Emilio|Karla|Carlitos|Karlita|todos)\b/i.test(after)) title = t.slice(0, idx).trim();
    }
    if (key === "desayuno" && title.indexOf(" · ") !== -1) title = title.split(" · ")[0].trim();
    title = title.replace(/\s{2,}/g, " ").replace(/\s+\)/g, ")").trim();
    return { title: title, paraProbar: paraProbar, tryItem: tryItem };
  }

  function parseLonchera1(raw) {
    var t = stripMarks(raw);
    var parts = t.split(/\s+\+\s+/);
    var toni = "",
      yuca = "",
      extra = "";
    parts.forEach(function (p) {
      if (/toni/i.test(p)) toni = p.replace(/\s*\([^)]*\)\s*$/, "").trim();
      else if (/pan de yuca/i.test(p)) yuca = p.replace(/\s*\([^)]*\)\s*$/, "").trim();
      else extra = p.replace(/\s*\([^)]*\)\s*$/, "").trim() || p;
    });
    return { toni: toni, yuca: yuca, extra: extra, raw: t };
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
    mast.appendChild(el("p", { class: "brand" }, [txt((DATA.meta && DATA.meta.family) || "Casa Arauz")]));
    mast.appendChild(el("h1", { class: "word-minuta" }, [txt("Minuta")]));
    mast.appendChild(el("p", { class: "range" }, [txt((DATA.meta && DATA.meta.range) || "")]));
    sheet.appendChild(mast);

    var sticky = el("div", { class: "sticky-nav" });
    var nav = el("nav", { class: "row", role: "navigation", "aria-label": "Secciones" });
    TABS.forEach(function (t, i) {
      if (i) nav.appendChild(el("span", { class: "dot", "aria-hidden": "true" }, [txt("·")]));
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

    function mealBlock(key, raw, personFilter) {
      var who = peopleFor(key, raw);
      if (personFilter && who.length && who.indexOf(personFilter) < 0) return null;
      var wrap = el("div", { class: "hoy-meal" });
      wrap.appendChild(el("p", { class: "lonch-label" }, [txt(MEAL_LABELS[key])]));
      if (isEmptyMeal(raw)) {
        wrap.appendChild(el("p", { class: "empty" }, [txt("Sin nada programado")]));
        return wrap;
      }
      var parsed = parseDish(key, raw);
      var titleEl = el("div", { class: "dish-title" }, [txt(parsed.title || stripMarks(raw))]);
      if (parsed.paraProbar) {
        titleEl.appendChild(el("span", { class: "stamp" }, [txt("Para probar")]));
        if (parsed.tryItem) titleEl.appendChild(el("span", { class: "try-item" }, [txt(parsed.tryItem)]));
      }
      wrap.appendChild(titleEl);
      if (who.length) wrap.appendChild(el("div", { class: "who" }, [txt(who.join(", "))]));
      return wrap;
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
            txt("Hoy es " + weekdayLong(today) + ". El ciclo empieza el " + weekdayLong(startDate) + "."),
          ])
        );
        status.appendChild(el("p", {}, [el("strong", {}, [txt(n === 1 ? "Falta 1 día." : "Faltan " + n + " días.")])]));
        day = DATA.days[0];
        status.appendChild(el("p", { class: "lede" }, [txt("Así abre el primer día, para Ramona y Angélica.")]));
      } else if (today > endDate) {
        status.appendChild(
          el("p", {}, [txt("Este ciclo ya cerró el " + weekdayLong(endDate) + ". Hay que armar el siguiente.")])
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
      angel.appendChild(el("p", { class: "role" }, [txt("Desayunos y loncheras")]));
      ["desayuno", "snack1", "snack2", "snackTarde"].forEach(function (k) {
        if (isWeekend(day) && (k === "snack1" || k === "snack2")) return;
        var block = mealBlock(k, day.meals && day.meals[k]);
        if (block) angel.appendChild(block);
      });
      cookingFor(DATA, "angelica", day).forEach(function (d) {
        var art = el("article", { class: "cook-dish" });
        if (d.name) art.appendChild(el("h3", {}, [txt(d.name)]));
        if (d.text) art.appendChild(el("p", { class: "cook-text" }, [txt(d.text)]));
        angel.appendChild(art);
      });
      var ramona = el("section", { class: "hoy-card" });
      ramona.appendChild(el("h2", {}, [txt("Ramona")]));
      ramona.appendChild(el("p", { class: "role" }, [txt("Almuerzos y cenas. Cocina una vez. Separa por persona.")]));
      ["almuerzo", "cena"].forEach(function (k) {
        var block = mealBlock(k, day.meals && day.meals[k]);
        if (block) ramona.appendChild(block);
      });
      cookingFor(DATA, "ramona", day).forEach(function (d) {
        var art = el("article", { class: "cook-dish" });
        if (d.name) art.appendChild(el("h3", {}, [txt(d.name)]));
        if (d.text) art.appendChild(el("p", { class: "cook-text" }, [txt(d.text)]));
        ramona.appendChild(art);
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
        (weeks[idx] || []).forEach(function (day) {
          var band = el("section", { class: "day-band" + (day.date === today ? " today" : "") });
          var h = el("h2", { class: "day-name" }, [txt(formatDay(day.label))]);
          if (day.date === today) h.appendChild(el("span", { class: "today-mark" }, [txt("Hoy")]));
          band.appendChild(h);
          if (day.note) band.appendChild(el("p", { class: "day-note" }, [txt(day.note)]));
          var table = el("table", { class: "meals" });
          var cap = el("caption", {});
          cap.style.cssText = "position:absolute;left:-9999px";
          cap.textContent = formatDay(day.label);
          table.appendChild(cap);
          var hr = el("tr", {});
          hr.appendChild(el("th", { scope: "col" }, [txt("Momento")]));
          hr.appendChild(el("th", { scope: "col" }, [txt("Plato")]));
          table.appendChild(el("thead", {}, [hr]));
          var tb = el("tbody", {});
          MEAL_KEYS.forEach(function (key) {
            var text = (day.meals && day.meals[key]) || "";
            var empty = isEmptyMeal(text);
            if (empty && SNACK_KEYS[key]) return;
            var who = peopleFor(key, text);
            var dim = personFilter && who.length && who.indexOf(personFilter) < 0;
            var tr = el("tr", { class: dim ? "dim" : "" });
            tr.appendChild(el("td", { class: "moment" }, [txt(MEAL_LABELS[key])]));
            var td = el("td", { class: "dish" });
            if (empty) td.appendChild(el("div", { class: "dish-title" }, [txt("Sin nada programado")]));
            else {
              var parsed = parseDish(key, text);
              var titleEl = el("div", { class: "dish-title" });
              titleEl.appendChild(txt(parsed.title || stripMarks(text)));
              if (parsed.paraProbar) {
                titleEl.appendChild(el("span", { class: "stamp" }, [txt("Para probar")]));
                if (parsed.tryItem) titleEl.appendChild(el("span", { class: "try-item" }, [txt(parsed.tryItem)]));
              }
              td.appendChild(titleEl);
              if (who.length) td.appendChild(el("div", { class: "who" }, [txt(who.join(", "))]));
            }
            tr.appendChild(td);
            tb.appendChild(tr);
          });
          table.appendChild(tb);
          band.appendChild(table);
          list.appendChild(band);
        });
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
      var box = el("div", {});
      box.appendChild(el("label", { for: cid, class: "lonch-item" }, [txt(title)]));
      if (hint) box.appendChild(el("p", { class: "lonch-hint" + (hintClass ? " " + hintClass : "") }, [txt(hint)]));
      row.appendChild(box);
      return row;
    }

    function buildLoncheras() {
      var panel = makePanel("loncheras");
      var intro =
        DATA.cooking && DATA.cooking.angelica && DATA.cooking.angelica.intro
          ? DATA.cooking.angelica.intro
          : "Loncheras listas en la mañana. Toni y pan de yuca van todos los días de colegio, aunque el resto cambie.";
      panel.appendChild(el("p", { class: "lede" }, [txt(intro)]));
      panel.appendChild(el("p", { class: "lede" }, [txt("Vista de Angélica. Marca lo que ya está en la lonchera.")]));
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
          b1.appendChild(el("p", { class: "lonch-label" }, [txt("Snack colegio 1")]));
          var parts = parseLonchera1(snack1);
          if (parts.toni) b1.appendChild(packRow(day.date, "toni", parts.toni, "Carlitos y Karlita"));
          if (parts.yuca)
            b1.appendChild(packRow(day.date, "yuca", parts.yuca, "solo Carlitos, una vez al día", "adobe"));
          if (parts.extra) b1.appendChild(packRow(day.date, "extra", parts.extra, "extra Karlita", "adobe"));
          if (!parts.toni && !parts.yuca && !parts.extra)
            b1.appendChild(packRow(day.date, "s1", stripMarks(snack1), ""));
          sec.appendChild(b1);
        }
        if (!isEmptyMeal(snack2)) {
          var b2 = el("div", { class: "lonch-block" });
          b2.appendChild(el("p", { class: "lonch-label" }, [txt("Snack colegio 2")]));
          var s2 = stripMarks(snack2).replace(/\s*\(ambos\)\s*$/i, "").trim();
          b2.appendChild(packRow(day.date, "s2", s2, "ambos"));
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
          if (block.intro) sec.appendChild(el("p", { class: "cook-intro" }, [txt(block.intro)]));
          (block.dishes || []).forEach(function (d) {
            var dish = el("article", { class: "cook-dish" });
            if (d.name) dish.appendChild(el("h3", {}, [txt(d.name)]));
            if (d.dates) dish.appendChild(el("p", { class: "cook-dates" }, [txt(d.dates)]));
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
          txt(
            "Cuando Emilio valide esta lista, se carga Supermaxi y limpieza en Tipti. El fresco (Mercado) se compra aparte. Él paga. El bot no hace checkout."
          ),
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
