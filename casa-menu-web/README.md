# Casa Menu Web — Minuta Arauz

Fuente de [casa-menu-web.vercel.app](https://casa-menu-web.vercel.app/). Antes vivia como un HTML suelto en Vercel (y reglas en `C:\rushr-ea\docs\MENU-BRAIN.md` del repo privado `rushr-ea`, al que este entorno no tiene acceso). Aqui queda el ciclo, la web y las instrucciones del bot juntas.

No mezclar con el sitio de Casas Ayampe. En Vercel, Root Directory = `casa-menu-web`.

## Que hay

| Pieza | Donde |
| --- | --- |
| Minuta, loncheras, cocina, compras, reglas | `public/` + `data/ciclo.json` |
| Reglas de comida | `docs/MENU-BRAIN.md` |
| Marcas Tipti | `docs/COMPRAS-BRAIN.md` |
| Instrucciones para pegar en Grok Bot | `docs/GROK-BOT.md` |
| Como llenar el carrito (sin checkout) | `docs/TIPTI-RUNBOOK.md` |
| Validador | `npm test` y `npm run validate` |

## Bot (Grok)

1. Pegar el bloque de `docs/GROK-BOT.md` como instrucciones permanentes.
2. Conectar el repo (este folder) y el navegador con sesion de Tipti ya iniciada por Emilio.
3. Arrancar cada ciclo con el mensaje corto de ese mismo archivo.
4. El bot edita `data/ciclo.json`, corre `npm test`, publica, espera validacion, llena Tipti. Emilio paga. Nunca checkout.

## Web

Mejoras respecto a la pagina anterior:

- Datos fuera del HTML (`data/ciclo.json`) para que el bot no toque la interfaz.
- Vista **Hoy** para Ramona (almuerzo/cena) y Angélica (desayuno/lonchera).
- Enlaces `#hoy` `#minuta` `#loncheras` `#cocina` `#compras` `#reglas`.
- Filtro por persona en la minuta.
- Loncheras con casilla de empacar.
- Lista Tipti separada del mercado, marcas y busqueda, copiar solo Tipti.
- PWA (instalar en el telefono) y `noindex`.
- Validador de hard rules (camarones, boloñesa, banano, emojis, merienda, 14 dias).

```bash
cd casa-menu-web
npm test
npm run validate
npm start
```

Ciclo vigente embebido: 1 al 14 de septiembre de 2026.

## Extraer a su propio repo

Cuando exista `earauzt/casa-menu-web`, mover esta carpeta a la raiz de ese repo y apuntar el proyecto Vercel ahi. Hasta entonces, este folder es el canonico.
