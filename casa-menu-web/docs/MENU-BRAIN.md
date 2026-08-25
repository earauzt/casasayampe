# MENU-BRAIN — Casa Arauz

Canonico de comida para el ciclo de 14 dias. La web lee `data/ciclo.json`. Este archivo manda sobre cualquier ocurrencia del modelo.

Cero emojis. Nunca la palabra "merienda" (usar snack colegio 1, snack colegio 2, snack de tarde).

## Gente

- Emilio (padre)
- Karla (madre)
- Carlitos (hijo)
- Karlita (hija)

Cocina:

- Ramona = almuerzos y cenas. Cocina una vez. Separa por persona.
- Angelica = desayunos y loncheras. Loncheras listas en la manana.

## Emilio

Objetivo aproximado: 1835 kcal / 185 g proteina / 150 g carbos / 55 g grasa.

SIEMPRE en almuerzo y cena: 180 g de proteina animal + 1 taza de arroz + encurtidos.

NUNCA: ensalada, vegetales, papa (horno, frita o pure). No agregar aceite extra.

Desayuno rota, receta aparte de la de los ninos:

- Batido: 240 ml leche + 1 scoop Isopure + 30 g avena
- Overnight oats + 2 huevos
- Pancakes de proteina + 2 huevos

Encurtidos (cebolla colorada + pepino + zanahoria en limon/sal/agua) SIEMPRE en stock. Es fijo semanal, no depende del menu del dia.

En platos de ninos que el no come igual:

- Lasaña: carne/queso SIN pasta + arroz + encurtidos
- Hamburguesa: patty SIN pan + arroz + encurtidos
- Pizza: porcion solo queso + proteina, sin vegetales, mas arroz y encurtidos aparte

## Karla

Come el plato base SOLO cuando es a la plancha (pollo, pescado, res, camarones).

Plato aparte cuando el menu es tacos, pizza, hamburguesa, lasaña, carbonara, fideos, apanado, frito, seco, boloñesa o sobras/batch de un plato que fue frito o apanado.

NUNCA: fideos boloñesa.

Puentes validos con la familia: salmon al horno, wrap de carne, pollo al horno, bowl de camarones.

Nunca meterla dentro de "todos" si la preparacion no es plancha ni puente valido.

## Carlitos

Objetivo aproximado: 2300 kcal, ~105 g proteina/dia (desayuno 25-30 / almuerzo-snack 30-35 / cena 35-40).

Actividad: SOLO miercoles. No almuerza en casa (almuerzo = fideo del cole).

Fijo diario de colegio: pan de yuca (una sola vez al dia, en snack colegio 1) + Toni chocolatada.

SI: quesadilla, tequeños, empanadita de queso, nuggets (cole), lasaña, tigrillo, bolon de verde con queso, salmon, hamburguesa, batido de guineo + 1 scoop proteina de huevo.

NUNCA: camarones, mantequilla de mani, yogur griego.

Vehiculo de proteina principal: batido de guineo + proteina de huevo. Si hubo banano/guineo en el desayuno, el snack de tarde NO es batido de guineo.

## Karlita

Objetivo aproximado: 35-45 g proteina/dia (dias de actividad, hasta 55-65 g repartido en desayuno + 3 snacks + cena, sin almuerzo real).

Actividad: lunes y miercoles. Llega ~16:30. Casi no almuerza esos dias. Snack de tarde reforzado.

Fijo diario de colegio: Toni chocolatada. NUNCA pan de yuca.

SI: camarones, quesadilla, empanadita de queso, tequeños, nuggets (cole), manzana roja cortada sin pelar, tortolines con queso crema (SOLO casa, nunca al cole), pancakes de banano con proteina escondida en la masa, tostadas francesas, huevo, waffles.

NUNCA: bolon, batidos (no toma), yogur griego, mantequilla de mani, pan de yuca, sanduche de pollo, galletas.

Lista de proteina angosta. Vehiculo principal: pancake de banano con proteina escondida. Respaldo: quesadillas, empanaditas, tequeños, nuggets, tortolines.

## Ambos ninos

NUNCA: pure, aguacate solo (guacamole si, poco frecuente).

Snacks de colegio SIEMPRE iguales entre los dos, MAS un extra fijo propio en el snack colegio 1 (junto con el Toni):

- Carlitos siempre suma pan de yuca (Karlita nunca lo come).
- Karlita siempre suma un extra de su lista SI (tequeños / empanadita de queso / nuggets), rotando para no repetir con el snack compartido de ese dia ni con su snack de tarde.

El pan de yuca de Carlitos va UNA sola vez al dia (snack colegio 1), nunca tambien en snack colegio 2.

No repetir banano el mismo dia.

## Hard rules (el validador las comprueba)

1. Nunca ensalada, vegetales o papa a Emilio.
2. Nunca camarones a Carlitos.
3. Nunca bolon a Karlita.
4. Nunca repetir banano el mismo dia (si el desayuno lleva banano, el snack de tarde de Carlitos no es batido de guineo).
5. Nunca decir merienda.
6. Nunca cena ligera (huevo, tortilla o sandwich como cena).
7. Siempre escribir los fijos explicitos cada dia (Toni, pan de yuca, encurtidos), aunque sean iguales todos los dias.
8. Siempre especificar snacks dia por dia, nunca "snack variado".
9. Nunca ofrecer yogur griego, mantequilla de mani o batido generico a los ninos.
10. Nunca meter a Karla dentro de "todos" si el plato no es plancha ni puente valido.

## Forma del ciclo

14 dias. Cada dia tiene: desayuno, snack1, snack2, almuerzo, snackTarde, cena.

Fines de semana no llevan lonchera de colegio (snack1/snack2 pueden ir vacios o con snack de casa).

Miercoles: fideo del colegio para los ninos. En casa, plancha + arroz + encurtidos para Emilio y Karla.

Domingo: parrillada. Cena = sobras de la parrilla. Emilio mantiene su fijo. No armes otro plato de sobras. Un "para probar" pequeno junto al plato seguro (tortilla de verde, muchin de yuca, etc.), sin repetir el del ciclo anterior.

Sabado: pizza casera para los ninos. Emilio no come pizza como plato. Karla plato ligero propio.

Revisar el ciclo anterior dia por dia para no repetir el mismo plato en el mismo dia de la semana.

## Salida

El bot no inventa HTML. Edita `data/ciclo.json` (fechas ISO, comidas, cocina, compras, reglas), corre `npm test` y `npm run validate`, y publica. La web se construye sola.

Mercado fresco y Tipti van separados en `shopping.mercado` vs `shopping.supermaxi` + `shopping.limpieza`.
