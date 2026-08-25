/**
 * Sandpiper bots — sit on top of Formspree + WhatsApp Business (app, not Cloud API).
 * 1) WhatsApp qualifier: 3 questions, then a structured wa.me message.
 * 2) Founders drip: honest thank-you (Formspree Free does not email the guest) + WhatsApp confirm + ICS.
 */
(function () {
  'use strict';

  var WA = '13059885341';
  var LANG = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var SKIP_ATTR = 'data-sp-skip-qualifier';

  var T = LANG === 'en' ? {
    qTitle: 'Before we open WhatsApp',
    qSub: '30 seconds. Emilio gets a complete message — you skip the back-and-forth.',
    intent: 'What do you need?',
    stay: 'Stay at the villa (founders list)',
    project: 'The project / more villas',
    buy: 'I want to buy a lot or a house',
    when: 'When would you like to come?',
    whenSkip: 'Not sure yet',
    pax: 'How many travelers?',
    paxNote: 'Entire home for up to 8. Not a suite.',
    more8: 'More than 8',
    name: 'Your name (optional)',
    namePh: 'Name',
    continue: 'Continue',
    send: 'Open WhatsApp',
    close: 'Close',
    buyNote: 'Nothing is for sale right now. We’ll tell Emilio so he can explain the rental model.',
    more8Note: 'The villa sleeps 8. Emilio can still help you plan.',
    thanksTitle: "You're on the list",
    thanksBody: 'Formspree notified Emilio. There is no automatic confirmation email on the current plan — confirm on WhatsApp and we’ll write you from there.',
    thanksWa: 'Confirm on WhatsApp',
    thanksIcs: 'Add October 2026 (rates + photos) to my calendar',
    thanksNote: 'Free, no card. You’ll hear from us before platforms.',
    icsTitle: 'Sandpiper Villas — rates to founders',
    icsDesc: 'Founding guests receive professional photos, nightly rates and the booking calendar first. casasayampe.com'
  } : {
    qTitle: 'Antes de abrir WhatsApp',
    qSub: '30 segundos. Emilio recibe el mensaje completo — te ahorras el ida y vuelta.',
    intent: '¿Qué necesitas?',
    stay: 'Alojarnos en la villa (lista de fundadores)',
    project: 'El proyecto / próximas villas',
    buy: 'Quiero comprar un lote o una casa',
    when: '¿Cuándo te gustaría venir?',
    whenSkip: 'Aún no lo sé',
    pax: '¿Cuántos viajan?',
    paxNote: 'Casa completa para hasta 8. No es una suite.',
    more8: 'Más de 8',
    name: 'Tu nombre (opcional)',
    namePh: 'Nombre',
    continue: 'Continuar',
    send: 'Abrir WhatsApp',
    close: 'Cerrar',
    buyNote: 'Hoy no hay inventario a la venta. Se lo decimos a Emilio para que te explique el modelo de alquiler.',
    more8Note: 'La villa es para 8. Emilio igual puede ayudarte a armar el plan.',
    thanksTitle: 'Estás en la lista',
    thanksBody: 'Formspree ya le avisó a Emilio. En el plan actual no sale un correo automático de confirmación — confírmanos por WhatsApp y te escribimos por ahí.',
    thanksWa: 'Confirmar por WhatsApp',
    thanksIcs: 'Agregar octubre 2026 (tarifas y fotos) a mi calendario',
    thanksNote: 'Gratis, sin tarjeta. Te avisamos antes que las plataformas.',
    icsTitle: 'Sandpiper Villas — tarifas a fundadores',
    icsDesc: 'Los huéspedes fundadores reciben primero las fotos profesionales, las tarifas y el calendario. casasayampe.com'
  };

  var DATES = LANG === 'en' ? [
    { v: 'nov-dic-2026', l: 'Nov – Dec 2026 (opening)' },
    { v: 'fin-de-ano-2026', l: "New Year's / holidays 2026" },
    { v: 'ene-mar-2027', l: 'Jan – Mar 2027' },
    { v: 'despues-2027', l: 'Later in 2027' },
    { v: 'no-se', l: T.whenSkip }
  ] : [
    { v: 'nov-dic-2026', l: 'Nov – Dic 2026 (apertura)' },
    { v: 'fin-de-ano-2026', l: 'Fin de año / feriados 2026' },
    { v: 'ene-mar-2027', l: 'Ene – Mar 2027' },
    { v: 'despues-2027', l: 'Más adelante en 2027' },
    { v: 'no-se', l: T.whenSkip }
  ];

  var PAX = [
    { v: '1-2', l: '1 – 2' },
    { v: '3-4', l: '3 – 4' },
    { v: '5-8', l: '5 – 8' },
    { v: '9+', l: T.more8 }
  ];

  function injectCss() {
    if (document.getElementById('sp-bots-css')) return;
    var s = document.createElement('style');
    s.id = 'sp-bots-css';
    s.textContent = [
      '#sp-qual{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;background:rgba(28,23,18,.45);padding:16px}',
      '@media(min-width:640px){#sp-qual{align-items:center}}',
      '#sp-qual .sp-card{width:100%;max-width:420px;background:#FBF8F1;color:#1C1712;border-radius:20px;padding:22px 22px 18px;box-shadow:0 20px 50px rgba(28,23,18,.22);max-height:90vh;overflow:auto}',
      '#sp-qual h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.7rem;font-weight:400;margin:0 0 6px}',
      '#sp-qual p.sp-sub{color:#6B5D4F;font-size:.9rem;margin:0 0 16px;line-height:1.45}',
      '#sp-qual label{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6B5D4F;margin:12px 0 6px}',
      '#sp-qual .sp-opts{display:flex;flex-direction:column;gap:8px}',
      '#sp-qual button.sp-opt{text-align:left;border:1px solid rgba(28,23,18,.15);background:#fff;border-radius:12px;padding:11px 14px;font-size:.95rem;cursor:pointer}',
      '#sp-qual button.sp-opt.is-on{border-color:#4A2E20;background:#4A2E20;color:#F6F2EA}',
      '#sp-qual input, #sp-qual select{width:100%;border:0;border-bottom:1px solid rgba(28,23,18,.25);background:transparent;padding:8px 0;font-size:1rem}',
      '#sp-qual .sp-note{font-size:.8rem;color:#B8755A;margin-top:8px}',
      '#sp-qual .sp-row{display:flex;gap:8px;margin-top:18px}',
      '#sp-qual .sp-go{flex:1;background:#4A2E20;color:#F6F2EA;border:0;border-radius:12px;padding:12px;font-weight:500;cursor:pointer}',
      '#sp-qual .sp-x{background:transparent;border:1px solid rgba(28,23,18,.15);border-radius:12px;padding:12px 14px;cursor:pointer}',
      '.sp-thanks-extra{margin-top:18px;display:flex;flex-direction:column;gap:10px}',
      '.sp-thanks-extra a{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:12px 16px;font-weight:500;text-decoration:none}',
      '.sp-thanks-wa{background:#25D366;color:#fff}',
      '.sp-thanks-ics{border:1px solid rgba(246,242,234,.35);color:#F6F2EA}',
      '.sp-thanks-ink .sp-thanks-ics{border-color:rgba(28,23,18,.2);color:#1C1712}',
      '.sp-thanks-ink p{color:#6B5D4F}'
    ].join('');
    document.head.appendChild(s);
  }

  function waUrl(text) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  }

  function buildMessage(state) {
    var intentMap = {
      stay: LANG === 'en' ? 'Stay — founding guests list' : 'Alojamiento — lista de fundadores',
      project: LANG === 'en' ? 'The project / next villas' : 'El proyecto / próximas villas',
      buy: LANG === 'en' ? 'Asked to buy (nothing for sale — explain rental model)' : 'Preguntó por compra (no hay venta — explicar modelo de renta)'
    };
    var dateLabel = (DATES.filter(function (d) { return d.v === state.when; })[0] || DATES[DATES.length - 1]).l;
    var paxLabel = (PAX.filter(function (p) { return p.v === state.pax; })[0] || PAX[0]).l;
    var lines = LANG === 'en' ? [
      'Hi Emilio — Sandpiper qualifier',
      'Name: ' + (state.name || '(not given)'),
      'Need: ' + intentMap[state.intent],
      'Dates: ' + dateLabel,
      'Guests: ' + paxLabel + ' (entire home, max 8)',
      'Lang: EN',
      'From: casasayampe.com'
    ] : [
      'Hola Emilio — calificador Sandpiper',
      'Nombre: ' + (state.name || '(sin nombre)'),
      'Necesita: ' + intentMap[state.intent],
      'Fechas: ' + dateLabel,
      'Huéspedes: ' + paxLabel + ' (casa completa, máx 8)',
      'Idioma: ES',
      'Desde: casasayampe.com'
    ];
    return lines.join('\n');
  }

  function closeQual() {
    var el = document.getElementById('sp-qual');
    if (el) el.remove();
  }

  function renderQual(state, pendingHref) {
    injectCss();
    closeQual();
    var wrap = document.createElement('div');
    wrap.id = 'sp-qual';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');

    function opt(group, value, label, current) {
      return '<button type="button" class="sp-opt' + (current === value ? ' is-on' : '') + '" data-g="' + group + '" data-v="' + value + '">' + label + '</button>';
    }

    var body = '';
    if (!state.intent) {
      body = '<label>' + T.intent + '</label><div class="sp-opts">' +
        opt('intent', 'stay', T.stay, state.intent) +
        opt('intent', 'project', T.project, state.intent) +
        opt('intent', 'buy', T.buy, state.intent) + '</div>';
    } else if (!state.pax) {
      body = '<label>' + T.pax + '</label><p class="sp-sub" style="margin-bottom:10px">' + T.paxNote + '</p><div class="sp-opts">' +
        PAX.map(function (p) { return opt('pax', p.v, p.l, state.pax); }).join('') + '</div>' +
        (state.intent === 'buy' ? '<p class="sp-note">' + T.buyNote + '</p>' : '');
    } else if (!state.when) {
      body = '<label>' + T.when + '</label><div class="sp-opts">' +
        DATES.map(function (d) { return opt('when', d.v, d.l, state.when); }).join('') + '</div>' +
        (state.pax === '9+' ? '<p class="sp-note">' + T.more8Note + '</p>' : '');
    } else {
      body = '<label>' + T.name + '</label><input type="text" id="sp-name" maxlength="80" placeholder="' + T.namePh + '">';
    }

    wrap.innerHTML = '<div class="sp-card"><h3>' + T.qTitle + '</h3><p class="sp-sub">' + T.qSub + '</p>' + body +
      '<div class="sp-row"><button type="button" class="sp-x" id="sp-close">' + T.close + '</button>' +
      (state.when ? '<button type="button" class="sp-go" id="sp-send">' + T.send + '</button>' : '') +
      '</div></div>';
    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) closeQual();
    });
    wrap.querySelector('#sp-close').addEventListener('click', closeQual);
    wrap.querySelectorAll('.sp-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state[btn.getAttribute('data-g')] = btn.getAttribute('data-v');
        renderQual(state, pendingHref);
      });
    });
    var send = wrap.querySelector('#sp-send');
    if (send) {
      send.addEventListener('click', function () {
        var nameEl = wrap.querySelector('#sp-name');
        state.name = nameEl ? nameEl.value.trim() : '';
        try { sessionStorage.setItem('sp_qual', JSON.stringify(state)); } catch (e) {}
        if (typeof gtag === 'function') {
          gtag('event', 'whatsapp_qualified', { intent: state.intent, pax: state.pax });
        }
        window.open(waUrl(buildMessage(state)), '_blank', 'noopener');
        closeQual();
      });
    }
  }

  function interceptWhatsapp() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
      if (!a) return;
      if (a.hasAttribute(SKIP_ATTR) || a.getAttribute('href').indexOf('calificador') !== -1) return;
      if (sessionStorage.getItem('sp_qual_done') === '1' && a.getAttribute('href').indexOf('text=') !== -1) return;
      e.preventDefault();
      renderQual({ intent: '', pax: '', when: '', name: '' }, a.getAttribute('href'));
    });
  }

  function icsHref() {
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sandpiper Villas//Founders//ES',
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20261001',
      'DTEND;VALUE=DATE:20261002',
      'SUMMARY:' + T.icsTitle,
      'DESCRIPTION:' + T.icsDesc,
      'URL:https://casasayampe.com/',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  }

  function enhanceLeadForm() {
    var form = document.getElementById('lead-form');
    if (!form) return;
    if (!form.querySelector('input[name="_gotcha"]')) {
      var honey = document.createElement('input');
      honey.type = 'text';
      honey.name = '_gotcha';
      honey.tabIndex = -1;
      honey.autocomplete = 'off';
      honey.setAttribute('aria-hidden', 'true');
      honey.style.cssText = 'position:absolute;left:-9999px;height:0;width:0;opacity:0';
      form.appendChild(honey);
    }

    form.addEventListener('submit', function () {
      /* existing page handler still runs; we hook after success by observing innerHTML */
    }, true);

    var obs = new MutationObserver(function () {
      if (form.querySelector('.sp-thanks-extra')) return;
      if (!form.querySelector('.ri-checkbox-circle-line')) return;

      var fd;
      try { fd = window.__spLastLead || {}; } catch (e) { fd = {}; }
      var name = fd.nombre || '';
      var when = fd.fechas_tentativas || fd.interes || 'no-se';
      var pax = fd.viajeros || '5-8';
      var intent = fd.interes ? 'project' : 'stay';
      var msg = buildMessage({ intent: intent, pax: pax === 'grupo-grande' ? '9+' : pax, when: when || 'no-se', name: name });
      var onDark = !form.closest('.bg-cream');

      var extra = document.createElement('div');
      extra.className = 'sp-thanks-extra' + (onDark ? '' : ' sp-thanks-ink');
      extra.innerHTML = '<p class="text-sm">' + T.thanksBody + '</p>' +
        '<a class="sp-thanks-wa" ' + SKIP_ATTR + ' target="_blank" rel="noopener" href="' + waUrl(msg) + '"><i class="ri-whatsapp-line"></i> ' + T.thanksWa + '</a>' +
        '<a class="sp-thanks-ics" download="sandpiper-fundadores-octubre-2026.ics" href="' + icsHref() + '">' + T.thanksIcs + '</a>' +
        '<p class="text-xs text-center" style="opacity:.7">' + T.thanksNote + '</p>';
      form.appendChild(extra);
      if (typeof gtag === 'function') gtag('event', 'founders_drip_shown');
    });
    obs.observe(form, { childList: true, subtree: true });

    form.addEventListener('submit', function () {
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      window.__spLastLead = data;
    });
  }

  interceptWhatsapp();
  enhanceLeadForm();
})();
