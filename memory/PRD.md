# Casas Ayampe — Sandpiper Villas Landing Page

## Original Problem Statement
> Rediseñar completamente el sitio casasayampe.com (Sandpiper Villas — ciudadela privada en Ayampe, Manabí, Ecuador). Enfoque de venta con WhatsApp como CTA principal. Estilo lujoso/premium con fondo oscuro (#1a1a2e), acentos dorados (#c9a84c) y tipografía blanca.

## Architecture
- **Type:** Static site (HTML + Tailwind CDN + vanilla JS)
- **Deploy:** GitHub Pages → casasayampe.com (CNAME)
- **Entry:** `/app/index.html`
- **Styles:** `/app/css/styles.css` (premium dark theme)
- **Scripts:** inline in `index.html` + `/app/js/main.js`
- **Form backend:** Formspree (xrbekwgj)

## User Personas
1. **Inversionista nacional (Ecuador):** busca plusvalía y escrituras seguras.
2. **Comprador extranjero (EEUU/Canadá/Europa):** busca segunda residencia costa Pacífico, habla español e inglés.
3. **Surfer / amante de playa:** busca lifestyle + ciudadela segura.

## Core Requirements (static)
- Estilo lujoso premium — fondo #0f1020/#1a1a2e, dorado #c9a84c, tipografía Fraunces + Outfit
- Hero fullscreen "Lujo sustentable en Ayampe"
- Propiedades: Lote 13 (653.58 m² · $98,037) y Villa Lote 4 (640 m² · 4D/4B · piscina · $272,674)
- Amenidades: laguna ornamental, beach tennis, ciudadela 24/7, acceso directo a playa
- Ubicación: 25 km Montañita, 17 km Puerto López, Ruta del Spondylus
- WhatsApp flotante +1 305 988 5341 (CTA primario)
- Formulario Formspree secundario
- SEO: Schema.org JSON-LD, Open Graph, meta optimizados

## What's been implemented (Jan 2026)
- [x] Rediseño completo de index.html con tema premium oscuro
- [x] Hero fullscreen con tipografía Fraunces (serif elegante) + Outfit (sans)
- [x] CTA WhatsApp flotante con animación pulse
- [x] Tarjeta destacada Villa Lote 4 en hero (conversión inmediata)
- [x] Sección propiedades con 2 tarjetas (Lote 13 y Villa Lote 4) con CTAs WhatsApp individuales
- [x] Sección amenidades (4 cards + masterplan visual)
- [x] Sección ubicación con mapa embedded estilo dark + distancias
- [x] Testimonio/social proof en pull-quote
- [x] Sección contacto dual: WhatsApp directo + formulario Formspree
- [x] FAQs con `<details>` nativo
- [x] Final CTA con imagen atardecer + urgencia
- [x] Footer premium
- [x] SEO: Schema.org RealEstateAgent + ItemList de propiedades
- [x] SEO: meta, canonical, Open Graph, Twitter cards
- [x] Textos con intención de búsqueda real (comprar lote Ayampe, villa frente al mar, etc.)
- [x] Animaciones reveal con IntersectionObserver + fallback 2.5s + `prefers-reduced-motion`
- [x] data-testid en todos los CTAs e inputs
- [x] Filtro CSS para mapa de Google (match con tema oscuro)

## SEO Improvements Made
1. **Title:** "Sandpiper Villas Ayampe | Lotes y Villas de Lujo Frente al Mar en Ecuador"
2. **Meta description** con precios reales + CTA WhatsApp
3. **Schema.org JSON-LD:** RealEstateAgent + ItemList con Products (precios)
4. **Canonical URL** añadido
5. **Open Graph + Twitter Cards** completos
6. **Keywords long-tail:** "terrenos en Ayampe", "villas frente al mar Ecuador", "Ruta del Spondylus"
7. **Alt text** descriptivos en todas las imágenes
8. **Jerarquía H1/H2/H3** correcta y semántica
9. **Robots:** `max-image-preview:large` para rich snippets
10. **`lang="es"`** correcto

## UX/UI Improvements Made (vs sitio anterior)
- ❌ Antes: fondo blanco genérico + azul/naranja → ✅ Ahora: premium oscuro + oro
- ❌ Antes: tipografía Roboto (genérica) → ✅ Ahora: Fraunces + Outfit (distintiva)
- ❌ Antes: 3 propiedades genéricas con precios iguales ($450,000) → ✅ Ahora: 2 propiedades reales con precios y metrajes exactos
- ❌ Antes: WhatsApp secundario al formulario → ✅ Ahora: WhatsApp es el CTA principal (user insight: "los leads no han sido óptimos pero por WhatsApp sí contactan")
- ❌ Antes: 3 CTAs primarios distintos → ✅ Ahora: un solo CTA primario (WhatsApp) repetido
- ❌ Antes: sin urgencia ni escasez → ✅ Ahora: "Disponibilidad limitada", "No duran mucho"
- ❌ Antes: sin social proof → ✅ Ahora: testimonio pull-quote
- ❌ Antes: amenidades no mostradas → ✅ Ahora: laguna, beach tennis, 24/7, acceso playa

## Backlog (P0/P1/P2)
### P0 — Conversión
- [ ] Integrar pixel de Facebook/TikTok para retargeting (mejora clave para optimizar leads)
- [ ] A/B test copy del hero (variantes: "Lujo sustentable" vs "Tu hogar frente al Pacífico")

### P1 — Contenido
- [ ] Galería fotográfica real del proyecto (carrusel con renders + fotos reales)
- [ ] Video tour de la ciudadela en hero (autoplay muted)
- [ ] Planos de las villas descargables PDF (captura email a cambio)
- [ ] Testimonios reales de propietarios con foto + nombre

### P1 — SEO
- [ ] Páginas individuales por propiedad: /propiedades/lote-13 y /propiedades/villa-lote-4
- [ ] Sitemap.xml actualizado con nuevas rutas
- [ ] Blog migrado al nuevo tema premium

### P2 — Funcionalidades
- [ ] Calculadora de financiamiento directo en la web
- [ ] Calendario de agendamiento de visitas (Calendly embebido)
- [ ] Chatbot 24/7 con IA (Intercom o custom con Emergent LLM)
- [ ] Multiidioma ES/EN

## Next Tasks
- Validar en producción con deploy a GitHub Pages
- Conectar Google Analytics 4 events específicos (click en WhatsApp, submit form)
- Optimizar imágenes a formato AVIF/WebP para mejor Core Web Vitals
