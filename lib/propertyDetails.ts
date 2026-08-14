export type PropertyDetails = {
  moreInfo: string[];
  amenities: string[];
  rules: string[];
};

export const propertyDetails: Record<string, PropertyDetails> = {
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
