# Casa David, Apulo

Ficha: `/p/casa-david-apulo-13-personas`.
Fuente de descripción, habitaciones, baños y fotos: anuncio Airbnb `1816839560642450342`, consultado el 13 de noviembre de 2026. No tiene un ID de STAYS confirmado; no se asigna el de otra propiedad.

Capacidad máxima: 13. Incluye 6 personas. Tarifa plataforma: $504.182 por noche de fin de semana, -30% entre semana, +20% puentes y 8 de diciembre, +50% Semana Santa y +100% fin de año. Mínimos: 1/2/3/4/5 noches, respectivamente. Adicional plataforma: $100.000 por persona y noche desde la séptima persona.

Se conserva la política directa existente de Alkila: 90% del alojamiento y del adicional, sin descuento a limpieza ($100.000) ni mascotas ($50.000 por estancia). Tarifas directas por noche: entre semana $317.635; fin de semana $453.764; puentes $544.517; Semana Santa $680.646; fin de año $907.528. Adicional directo: $90.000. No se ofrecen automáticamente servicios no confirmados para esta casa.

Solo se cotizan noches del 13 de noviembre de 2026 al 28 de abril de 2027 inclusive. La salida puede ser el 29 de abril. Se aplica la prioridad existente de temporadas sin acumular recargos; una noche ocupada del 20 de diciembre al 6 de enero activa la tarifa de fin de año para toda la reserva.

## Activación de calendarios (pendiente)

1. Obtener desde Casa David en Airbnb el enlace privado **Exportar calendario**. El enlace público del anuncio no es un calendario.
2. Configurar ese enlace en la variable de servidor `AIRBNB_ICAL_CASA_DAVID_URL`. No guardarlo en Git ni enviarlo al cliente.
3. Importar en Airbnb el calendario directo de Alkila: `https://www.alkila.co/api/calendar/casa-david-apulo-13-personas`.
4. Comprobar una reserva/bloqueo real de Airbnb en Alkila y un bloqueo directo de Alkila en Airbnb. El checkout debe quedar libre si no hay otra reserva; no crear pagos ni reservas ficticias en producción.
5. Solo después de confirmar la importación en Airbnb, establecer `CASA_DAVID_AIRBNB_IMPORT_CONFIRMED=true` y publicar la configuración de servidor. Si esta casa también se publica en Booking, configurar `BOOKING_ICAL_CASA_DAVID_URL` y la importación de salida correspondiente.

Hasta completar ambos sentidos, la ficha muestra fotos, tarifas, condiciones y consulta por WhatsApp/Airbnb. El calendario y pago directos permanecen deshabilitados, y los endpoints de disponibilidad/reserva también rechazan operaciones. Una respuesta externa que no sea un VCALENDAR válido tampoco se interpreta como calendario vacío.

iCal sincroniza ocupación, no tarifas, mínimos ni cobros. La actualización depende del refresco de cada plataforma y no es instantánea. El exportador solo incluye reservas directas pagadas y bloqueos manuales; no reexporta eventos importados ni datos de huéspedes.

## Validación

`node --test tests/pricing.test.cjs tests/quotations.test.cjs tests/casa-david.test.cjs`

Pruebas sin llamadas a producción: tarifas para 6/7/13 personas, capacidad, límites de vigencia, temporadas y cruces de año, mínimos, extras, importación y exportación iCal, calendario faltante o inválido y protección del pago antes de activar la sincronización.
