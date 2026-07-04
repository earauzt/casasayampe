# Casas Ayampe — Sandpiper Landing Page

## Original Problem Statement
Rediseñar casasayampe.com con enfoque editorial (estilo CasitaMX) — ciudadela privada Sandpiper en Ayampe, Ecuador, con narrativa del promotor: 8 lotes en total, solo Lote 13 a la venta + Casa Marea (antes Villa Lote 4) en obra gris a precio de costo para liquidez.

## Architecture
- Static site (HTML + Tailwind CDN + vanilla JS)
- Deploy: GitHub Pages → casasayampe.com (CNAME)
- Entry: `/app/index.html`
- Styles: `/app/css/styles.css`
- Form backend: Formspree (xrbekwgj)

## Design System (iteración 2 — estilo editorial)
**Paleta (warm editorial, inspirada en CasitaMX):**
- `sand` #E8E2D5 — fondo principal (hero)
- `cream` #F6F2EA — fondo secundario
- `paper` #FBF8F1 — fondo terciario
- `ink` #1C1712 — texto principal
- `clay` #6B5D4F — texto secundario
- `cacao` #4A2E20 — acento principal (botones)
- `terracotta` #B8755A — acento secundario
- `tan` #C9986A — acento suave

**Tipografía:**
- Display: **Cormorant Garamond** (400/300/italic) — titulares editoriales
- Body: **Inter** (400/500) — texto corrido
- Script accent: **Caveat** — logo + frases de promotor

## User Personas
1. Inversionista nacional con interés en segunda residencia
2. Comprador extranjero (EEUU/Canadá/Europa) buscando costa Pacífico
3. Constructor/persona con gusto arquitectónico (target principal de Casa Marea en obra gris)

## Core Business Context (crítico)
- **Promotor:** 1 persona (responde WhatsApp directamente)
- **Sandpiper:** ciudadela privada de 8 lotes
- **Solo 1 lote a la venta:** Lote 13 ($98,037 — 653.58 m²). Los otros 7 los conserva el promotor para desarrollar.
- **Solo 1 casa a la venta:** Casa Marea (antes Villa Lote 4). Precio: $272,674 en OBRA GRIS (estructura terminada, falta acabados). Se vende a precio de costo para liquidez para financiar próximas villas.
- **Nombre "Casa Marea":** propuesto por el agente (Tulum-style, Spanish, evocador, pairs elegantly con Sandpiper).
- **WhatsApp:** +1 305 988 5341 (único canal de conversión)

## What's been implemented (Jan 2026)
### Iteración 1 (descartada — dark luxury)
- Versión con tema oscuro #0f1020 + oro #c9a84c + Fraunces

### Iteración 2 (actual — editorial warm, estilo CasitaMX)
- [x] Paleta warm beige + chocolate cacao + scripts (basada en CasitaMX)
- [x] Tipografía Cormorant Garamond (display) + Inter (body) + Caveat (accent)
- [x] Hero editorial grande — "Lujo sustentable en Ayampe" en serif italic enorme
- [x] Sección "Una carta del promotor" — narrativa en primera persona explicando los 8 lotes
- [x] Grid editorial de 4 imágenes bajo hero (estilo revista)
- [x] Casa Marea como propiedad destacada con galería de 3 thumbs
- [x] Lote 13 con layout alternado (sticky info + imagen grande)
- [x] Copy coherente: "único lote disponible", "obra gris", "precio de costo"
- [x] Amenidades en grid minimalista (4 cards)
- [x] Ubicación con distancias editoriales (17km, 25km, 1.5h)
- [x] Quote pull editorial
- [x] Contacto dual: WhatsApp + formulario sobre fondo cacao
- [x] FAQs específicos al contexto (¿por qué solo vendes uno?, ¿qué es obra gris?, etc.)
- [x] Final CTA de urgencia real: "cuando se venda no hay otro"
- [x] Footer minimal con logo script
- [x] SEO actualizado: title/description/schema con nuevos datos
- [x] data-testid en todos los CTAs e inputs

## SEO
1. Title: "Sandpiper Ayampe | Ciudadela de Lujo Sustentable en la Costa de Ecuador"
2. Description con precios + CTA + "obra gris" (keyword relevante)
3. Schema.org RealEstateAgent + ItemList (Casa Marea + Lote 13 con precios)
4. Canonical, Open Graph, Twitter cards completos
5. Keywords: "terrenos Ayampe", "Casa Marea Ayampe", "obra gris Ecuador", "Ruta del Spondylus"

## Conversion-focused copy improvements
- ❌ Antes: "Tres propiedades disponibles" (genérico)
- ✅ Ahora: "Ocho lotes. Dos oportunidades." (escasez real)
- ❌ Antes: "Plusvalía proyectada del 15%"
- ✅ Ahora: "Precio por debajo del costo de construcción" (razón auténtica)
- ❌ Antes: testimonios fake
- ✅ Ahora: carta honesta del promotor + una reseña real

## Known gaps / notas
- **Instagram @apx.luxuryhomes:** Instagram bloquea scraping (403). El promotor debe descargar fotos/videos reales y subirlas al repo para reemplazar los assets actuales (hero.jpg, casa1.webp, terreno.jpg, etc.). La estructura de `images/` ya está lista.
- **Nombre Casa Marea:** propuesto. Si el promotor prefiere otro (Casa Palma, Casa Manglar, Villa Spondylus, Casa Ola, etc.) es un find&replace rápido.

## Backlog (P0/P1/P2)
### P0
- [ ] Reemplazar imágenes placeholder con fotos reales del Instagram
- [ ] Confirmar nombre final de "Casa Marea" con el promotor
- [ ] Agregar moodboard de acabados sugeridos para Casa Marea (ayuda al comprador a visualizar)
- [ ] Pixel Facebook/Instagram para retargeting

### P1
- [ ] Video tour del proyecto en hero (muted autoplay)
- [ ] Galería dedicada de fotos del masterplan / render
- [ ] Página individual /casa-marea con planos completos
- [ ] Página individual /lote-13
- [ ] Descarga de brochure PDF contra email

### P2
- [ ] Multiidioma ES/EN
- [ ] Calculadora de acabados estimados para Casa Marea
- [ ] Calendly para agendar visitas

## Preapertura Sandpiper Villas (Jul 2026)
**Página:** `/casas-vacacionales-ayampe.html` — landing de captación de leads para la preapertura de las 2 villas de renta vacacional (apertura estimada nov-2026).
- **Estrategia elegida:** lead con intención de reserva ("lista de huéspedes fundadores"), NO pre-booking con pago. Razones: fecha de obra no confirmada, sin motor de pagos, sin tarifas definidas. Se convierte a reserva real cuando se confirme fecha (oct-2026 según timeline).
- **Datos usados (del brochure APX en Drive):** 2 villas gemelas, 4 dorm / 4 baños, 331 m² construcción, terreno 650 m², parqueo techado, bodega, lavandería, hasta 8 huéspedes.
- **Form:** mismo Formspree (xrbekwgj) con hidden `_subject` + `origen=preapertura-villas`; campos: nombre, whatsapp, email, fechas tentativas, nº viajeros, motivo del viaje. Evento GA4 `generate_lead` al enviar.
- **SEO:** title/meta/OG propios, canonical, Schema VacationRental + FAQPage. Keywords: "casa vacacional Ayampe", "hospedaje en Ayampe", "dónde alojarse en Ayampe", "alquiler casa de playa Ecuador", "airbnb Ayampe", "alojamiento Ruta del Spondylus". Enlaces internos a los 4 posts del blog.
- **Index:** pill en hero + link "Villas · Preapertura" en nav desktop y móvil.
- **Pendiente:** fotos reales de la obra (las de `images/` son placeholder), % de descuento fundador a confirmar por el promotor, tarifa por noche.
- **Nota:** `images/atardecerahorcado.JPG` está corrupto (2 bytes) — se usa `ahorcado.webp` en su lugar.
- **Iteración 2 (mismo día):** el promotor compartió screenshots de casitahomes.com como formato de referencia. La página se reestructuró al formato "property page" de Casita: hero foto full-bleed con nombre encima + "Ver todas las fotos", fila de stats con íconos (8 huéspedes · 4 habitaciones · 4 baños · 331 m²), pill de respuesta en 24h, callout de WhatsApp para grupos, secciones Habitaciones (cards con ícono de cama; distribución de camas por confirmar), Amenidades (lista de íconos), Temporadas de precios (tabla con tarifas bloqueadas "se anuncia a la lista"), mapa embebido de Google Maps, tarjetas "Lo que necesitas saber" (sin compromiso / reglas de la casa / eventos), "Más en Sandpiper" (Casa Marea + Lote 13), y barra fija inferior estilo booking con CTA "Unirme a la lista".

## Reestructura del sitio (04-jul-2026)
- **`index.html` (home) = la página de preapertura de villas** (formato Casita). La antigua home de venta se guardó en `/inversion-sandpiper-ayampe.html` (sigue indexable, enlazada discretamente vía "¿Buscas comprar?", FAQ y "Más en Sandpiper"). `/casas-vacacionales-ayampe.html` quedó como stub de redirección (noindex + meta refresh a `/`).
- **Blog renovado al design system editorial** (mismo header/footer que la home nueva, WhatsApp +1 305 988 5341): `blog.html` (listado "Guías de Ayampe") + 5 artículos reescritos con copy SEO ampliado, schema Article + BreadcrumbList + FAQPage, FAQ visible, CTA a la lista de fundadores y artículos relacionados. Generador: se usó plantilla común (los artículos comparten estructura).
- **Nuevos:** `sitemap.xml` (8 URLs) y `robots.txt` (no existían).
- Los artículos usan las imágenes existentes de `images/blog/`. El artículo de surf conserva su URL con "2025" (historial SEO) pero título/contenido actualizados a 2026.

## Next Tasks
- Push a GitHub para deploy a casasayampe.com
- Subir fotos reales del proyecto
- Validar copy del promotor (especialmente la "carta")
