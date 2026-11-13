export type PropertyDetails = {
  moreInfo: string[];
  amenities: string[];
  rules: string[];
};

export const propertyDetails: Record<string, PropertyDetails> = {
  "casa-david-apulo-13-personas": {
    moreInfo: [
      "Casa privada en Apulo para grupos de hasta 13 personas, con 4 habitaciones y 4,5 baños.",
      "Habitación principal con cama king y sencilla; dos habitaciones con cama doble y sencilla; una habitación con cama doble. Además, cuenta con dos sofá camas.",
      "Piscina privada, kiosco con billar y máquina arcade, zona BBQ con parrilla y ahumador.",
      "Cocina abierta, balcones con vista a las montañas, jardines y cerramiento completo.",
    ],
    amenities: ["Piscina privada", "Billar", "Máquina arcade", "Parrilla y ahumador", "Cocina abierta", "Balcones con vista a las montañas", "Jardines y cerramiento completo"],
    rules: [
      "La tarifa incluye hasta 6 personas. Registra la cantidad real de huéspedes; desde la séptima persona se cobra un adicional por persona y noche, hasta un máximo de 13.",
      "La tarifa directa de Alkila tiene un 10% de descuento en alojamiento y huéspedes adicionales frente a la tarifa de plataforma. El adicional directo es de $90.000 por persona y noche.",
      "Limpieza: $100.000 por estancia. Mascotas: $50.000 por estancia.",
      "Estadía mínima: 1 noche entre semana, 2 noches en fin de semana ordinario y 3 noches en puentes y festivos programados.",
      "Semana Santa (21 al 28 de marzo de 2027): recargo del 50% y mínimo 4 noches. Fin de año (20 de diciembre de 2026 al 6 de enero de 2027): recargo del 100% y mínimo 5 noches.",
      "En Alkila, si la reserva ocupa alguna noche de fin de año, esa tarifa y el mínimo de 5 noches se aplican a toda la reserva. Los recargos no se acumulan.",
      "Tarifas programadas para noches del 13 de noviembre de 2026 al 28 de abril de 2027. Para otras fechas, consulta por WhatsApp.",
      "Las horas de llegada y salida y las demás condiciones se confirman al reservar. Los servicios adicionales distintos de mascotas requieren consulta previa.",
    ],
  },
  "cabana-privada-anapoima-8-personas": {
    moreInfo: [
      "Casa recreativa privada para relajarse con familia o amigos en un entorno tranquilo.",
      "Ubicada a pocos minutos del centro de Anapoima, ideal para descansar sin quedar lejos del pueblo.",
      "Cuenta con 2 habitaciones y acomodación cómoda para grupos de hasta 8 personas.",
      "Es una opción práctica para quienes buscan piscina, jacuzzi y zonas sociales en un formato más compacto.",
    ],
    amenities: [
      "Piscina privada",
      "Jacuzzi",
      "Cocina",
      "Wifi",
      "Parqueadero gratuito en la propiedad",
      "Zona tranquila y privada",
      "Espacios para familia o grupo de amigos",
    ],
    rules: [
      "Capacidad máxima: 8 huéspedes.",
      "Las condiciones finales de llegada, salida y uso de espacios se confirman al reservar.",
      "No se reporta detector de monóxido de carbono.",
      "No se reporta detector de humo.",
      "El cuidado de las zonas húmedas y áreas comunes es responsabilidad del grupo durante la estadía.",
    ],
  },
  "casa-campestre-anapoima-16-personas": {
    moreInfo: [
      "Casa campestre de aproximadamente 450 m² en un lote de 1.000 m², distribuida en dos pisos.",
      "Tiene 4 habitaciones con baño privado, aire acondicionado, Smart TV y ventilador de techo.",
      "En el primer piso están comedor, cocina, sala, BBQ, piscina/jacuzzi, baño social y 2 habitaciones.",
      "En el segundo piso están las otras 2 habitaciones y una terraza amplia para descansar.",
      "La cocina es abierta, integrada al comedor, con nevecón, estufa a gas, cafetera y menaje.",
    ],
    amenities: [
      "Piscina/jacuzzi privado",
      "Vista a la montaña y al jardín",
      "Cocina integral equipada",
      "Wifi",
      "Zona de trabajo privada",
      "Aire acondicionado en habitaciones",
      "Smart TV y ventilador de techo",
      "BBQ con cocina de leña",
      "Parqueadero para hasta 5 carros",
      "Frutales y zonas verdes",
    ],
    rules: [
      "Check-in flexible y salida antes de las 12:00 p.m.",
      "Se admiten mascotas con tarifa adicional.",
      "El cierre de la casa y activación de alarma se acuerda con el mayordomo.",
      "Servicio de limpieza y apoyo en cocina disponible con costo adicional.",
      "A partir del huésped 17 aplica tarifa adicional por persona y noche.",
      "Se puede alimentar a las gallinas solo con frutas y verduras.",
      "La pesca puede tener costo adicional y debe coordinarse en la finca.",
    ],
  },
  "finca-anapoima-22-personas": {
    moreInfo: [
      "Finca amplia de aproximadamente 950 m² distribuida en tres niveles, ideal para grupos grandes.",
      "Cuenta con 7 habitaciones con baño privado y acomodación en camas para grupos familiares.",
      "En el primer piso hay sala, comedor, bar, billar profesional, cocina, patio, piscina, jacuzzi y baño social.",
      "Tiene una habitación en el primer piso pensada para personas que prefieren evitar escaleras.",
      "El segundo piso reúne 6 habitaciones, sala de estar, mirador y sala de fuego.",
      "El kiosco tiene estufa de leña, horno de barro, asador de parrilla y comedor en madera para reuniones.",
    ],
    amenities: [
      "Piscina infinita privada",
      "Jacuzzi privado de gran formato",
      "Vista a la montaña y al jardín",
      "Acceso a lago de pesca",
      "Cocina amplia equipada",
      "Wifi en dos redes",
      "Billar profesional",
      "Bar, video beam y telón",
      "Kiosco con cocina de leña, horno y asador",
      "Parqueadero cubierto para hasta 7 carros",
      "Frutales, senderos y zonas verdes",
      "Animales de granja y aves",
    ],
    rules: [
      "Check-in flexible y salida antes de las 12:00 p.m.",
      "Se admiten mascotas con tarifa adicional.",
      "El valor puede variar según la cantidad de huéspedes; desde el huésped 17 aplica tarifa adicional por persona y noche.",
      "El cierre de la casa y activación de alarma se acuerda con el mayordomo.",
      "La finca cuenta con cámaras en zonas comunes y entradas por seguridad.",
      "El lago es para contemplación o pesca; no es apto para bañarse.",
      "Se pueden recolectar algunas frutas para consumo durante la estadía.",
    ],
  },
};
