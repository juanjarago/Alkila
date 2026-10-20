# Cotizaciones administrativas

## Uso

Entrar a `/admin`, abrir **Cotizaciones**, seleccionar propiedad, ingreso, salida,
huéspedes y adicionales. Calcular la vista previa y guardar. Luego descargar
imagen PNG (1080 x 1920), PDF de una página (360 x 640 pt) o copiar el enlace.
Se reutilizan el token administrativo, el logo aprobado, las fotografías del
catálogo y el motor de precios y disponibilidad ya existentes.

La creación requiere autenticación. El enlace compartido es de solo lectura;
cualquier persona que lo reciba puede ver esa cotización. El token aleatorio de
256 bits se transporta en el fragmento y se consulta mediante POST. No incluye
credenciales de administración ni permite listar otras cotizaciones.

## Base de datos y despliegue

Aplicar una sola vez `database/admin-quotes.sql` en el proyecto Supabase existente
antes de desplegar el código. Requiere las variables de servidor ya usadas por el
sitio: `ADMIN_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Nunca exponer la
clave de servicio como variable `NEXT_PUBLIC_*` ni incluirla en el repositorio.

La tabla `admin_quotes` tiene RLS activado y no concede acceso a `anon` ni a
`authenticated`. Solo el servidor con `service_role` puede leer, insertar o anular
cotizaciones. No se altera ninguna tabla de reservas, precios o contactos.
No hay almacenamiento temporal de respaldo: si Supabase falla, emitir falla.

El servidor recalcula antes de guardar y rechaza el guardado si el resultado ya
no coincide con la vista previa que revisó el administrador. Los importes
emitidos quedan como una instantánea inmutable. Se muestran las últimas 50
cotizaciones y es posible anular sus enlaces; los archivos ya enviados no pueden
retirarse. Vigencia configurable de 1 a 168 horas, como máximo hasta el día de
entrada en hora de Colombia. Las fechas se comprueban nuevamente antes de pagar.

## Pagos: alcance de esta versión

Se permite pegar un enlace HTTPS **ya creado** en Mercado Pago o checkout Wompi.
El administrador debe verificar destinatario, referencia, importe fijo (anticipo
30 % o total) y expiración en el proveedor. La casilla de verificación de importe
es obligatoria al incluir un enlace. El PDF enlaza a la cotización, no directamente
al proveedor. Una imagen PNG no contiene hipervínculos: debe enviarse acompañada
del enlace copiado.

Este módulo **no genera preferencias de cobro**, no integra webhooks nuevos, no
reconcilia pagos, no bloquea inventario y no crea ni confirma reservas. Los pagos
mediante enlaces externos deben validarse y registrarse con el procedimiento
habitual de Alkila. Anular o vencer la cotización bloquea el acceso al pago desde
ella; no anula un checkout externo que ya se haya abierto. Configurar también su
expiración en el proveedor.

Los controles de disponibilidad heredados verifican calendarios configurados,
reservas pagadas y bloqueos manuales. No equivalen a un bloqueo transaccional de
inventario. No anunciar confirmación automática hasta implementar esa integración.

## Validación

```sh
npm ci
node --test tests/quotations.test.cjs
npx tsc --noEmit
npm run build
```

La suite prueba las funciones y rutas reales de cotizaciones con precios,
disponibilidad y llamadas Supabase simulados. No usa credenciales de producción,
no hace cobros ni modifica reservas. Cubre autenticación, fechas, capacidad,
importes, cambios de tarifas, persistencia, privacidad, vencimiento, anulación,
enlaces y estructura del PDF. No sustituye una prueba de pago real ni una revisión
en móvil del despliegue final.

Para revertir la funcionalidad, revertir su commit de código. Conservar la tabla
privada para no perder el historial; no ejecutar `DROP TABLE` como rollback.
