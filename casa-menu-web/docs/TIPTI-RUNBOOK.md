# Tipti — como llenar el carrito (sin pagar)

Emilio paga. El bot nunca hace checkout.

## Puerta previa

No abrir Tipti hasta que Emilio valide la lista (boton "Ya revise la lista" en la web, o un OK explicito en el chat).

## Alcance

Entra al carrito: `shopping.supermaxi` + `shopping.limpieza` de `data/ciclo.json`.

No entra: `shopping.mercado`.

Marcas: `docs/COMPRAS-BRAIN.md`.

## Pasos

1. Abrir Tipti con la sesion que Emilio ya inicio. No pedir ni guardar contraseñas. No cambiar direccion ni metodo de pago.
2. Confirmar que la tienda es Supermaxi y que la direccion de entrega es la de siempre. Si no coincide, parar.
3. Vaciar el carrito viejo solo si Emilio lo pidio. Si hay cosas ajenas al ciclo, preguntar antes de borrar.
4. Por cada item pendiente (no marcado comprado):
   - Buscar con la query de COMPRAS-BRAIN.
   - Elegir la marca preferida. Si no hay stock, anotar y seguir; no sustituir en silencio.
   - Cargar la cantidad del ciclo. Si el empaque no calza (ej. huevos de 30 vs 65 unidades), redondear hacia arriba al paquete y decirlo.
5. Recorrer el carrito y armar el reporte:
   - Item, marca, cantidad, precio si se ve.
   - Faltantes.
   - Sustituciones propuestas (sin aplicar).
   - Total aproximado si Tipti lo muestra.
6. Mostrar el reporte y esperar. Emilio paga en su telefono o en la web.
7. No tocar "Pagar", "Confirmar pedido", "Colocar orden" ni equivalentes.

## Si algo falla

- Tipti caido o pide 2FA: parar. Emilio entra y retoma.
- Item sin stock y el sustituto es otra proteina o un alergeno distinto: parar ese item.
- El bot no envia enlaces de carrito por email a menos que Emilio lo pida.

## Despues del pago

Emilio marca en la web lo que ya compro, o el bot puede marcar Supermaxi + limpieza como listos si Emilio lo confirma. Mercado se tilda el dia de plaza.
