# Tarifas acordadas: 28 octubre 2026 a 28 abril 2027

La última noche incluida es el 28 de abril. Las tarifas anteriores se conservan fuera del período y para la cabaña pequeña. Los slugs se conservan para no romper enlaces existentes.

| Casa | Plataforma/noche | Incluidos | Adicional plataforma | Capacidad |
| --- | ---: | ---: | ---: | ---: |
| Grande | 1.300.000 | 10 | 100.000 | 24 |
| Mediana | 800.000 | 6 | 80.000 | 16 |

Alkila aplica el 90% al alojamiento y al adicional fijo por persona. Conserva los cargos configurados de aseo, mascotas y servicio doméstico; early check-in y late checkout se calculan con el precio efectivo de la noche. No se modifican cotizaciones ya emitidas.

Prioridad por noche: fin de año > Semana Santa/receso > puente/festivo > viernes/sábado > entre semana. Nunca se suman recargos ni se aplica un recargo sobre la tarifa ya rebajada de entre semana.

- Entre semana: 70% de la tarifa estándar. Se conserva el mínimo previo de dos noches porque no se acordó otro mínimo entre semana.
- Viernes/sábado: base, mínimo dos noches.
- Puente con lunes festivo: viernes, sábado y domingo al 120%, mínimo tres noches. La noche del lunes vuelve al 70%, salvo temporada superior.
- 8 diciembre: 120%, mínimo tres noches; no se extiende automáticamente a noches vecinas.
- Semana Santa: 150%, mínimo cuatro noches; calendario existente del domingo de Ramos al domingo de Pascua inclusive (21–28 marzo 2027).
- Cualquier noche ocupada entre 20 diciembre 2026 y 6 enero 2027 inclusive activa 200% y mínimo cinco noches para toda la reserva. La fecha de salida no es una noche ocupada.
- No hay mitad de año ni receso dentro de esta ventana; no se inventan fechas para extender el acuerdo.

Durante esta ventana, el acuerdo prevalece sobre las tarifas antiguas guardadas en `pricing_rules` y `seasonal_rates`. No se borran esas configuraciones. Para cambiar este acuerdo hay que actualizar `standardPricing.ts`; el editor administrativo antiguo no modifica estas tarifas en la ventana.

## Pendientes de plataformas y decisiones abiertas

- Airbnb y Booking: completar/verificar calendarios, mínimos, promociones y capacidades.
- Booking: mantener Genius, retirar otros descuentos adicionales; Grande 24 adultos y hasta cuatro bebés adicionales; Mediana 16 adultos y hasta cuatro bebés adicionales. El cotizador directo conserva su campo único de personas, sin inventar un tratamiento de bebés.
- Tratamiento estacional del adicional: pendiente de acuerdo e implementación equivalente en plataformas. En Alkila se conserva el adicional fijo expresamente indicado, con 10% de descuento, sin multiplicarlo por temporada.
- Entradas y salidas obligatorias: no se han definido días exactos, por lo que no se añaden restricciones.
- En plataformas no se ha verificado que el recargo de fin de año afecte la totalidad de reservas que cruzan el período. Alkila sí lo calcula así.
- Casa Grande permanece cerrada en Booking por facturas pendientes; este cambio no interviene ese cierre.

## Validación

`node --test tests/pricing.test.cjs tests/quotations.test.cjs`

Se prueban precios y límites de ambas casas, puentes/lunes, 8 diciembre, Semana Santa, cruces de fin de año, checkout excluido, adicionales, capacidad, configuraciones antiguas, extras y conflictos. Las pruebas no contactan producción ni crean reservas o pagos.
