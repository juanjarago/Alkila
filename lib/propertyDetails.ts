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
      "Cuenta con 2 habitaciones y acomodacion comoda para grupos de hasta 8 personas.",
      "Es una opcion practica para quienes buscan piscina, jacuzzi y zonas sociales en un formato mas compacto.",
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
      "Capacidad maxima: 8 huespedes.",
      "Las condiciones finales de llegada, salida y uso de espacios se confirman al reservar.",
      "No se reporta detector de monoxido de carbono.",
      "No se reporta detector de humo.",
      "El cuidado de las zonas humedas y areas comunes es responsabilidad del grupo durante la estadia.",
    ],
  },
  "casa-campestre-anapoima-16-personas": {
    moreInfo: [
      "Casa campestre de aproximadamente 450 m2 en un lote de 1.000 m2, distribuida en dos pisos.",
      "Tiene 4 habitaciones con bano privado, aire acondicionado, Smart TV y ventilador de techo.",
      "En el primer piso estan comedor, cocina, sala, BBQ, piscina/jacuzzi, bano social y 2 habitaciones.",
      "En el segundo piso estan las otras 2 habitaciones y una terraza amplia para descansar.",
      "La cocina es abierta, integrada al comedor, con nevecon, estufa a gas, cafetera y menaje.",
    ],
    amenities: [
      "Piscina/jacuzzi privado",
      "Vista a la montana y al jardin",
      "Cocina integral equipada",
      "Wifi",
      "Zona de trabajo privada",
      "Aire acondicionado en habitaciones",
      "Smart TV y ventilador de techo",
      "BBQ con cocina de lena",
      "Parqueadero para hasta 5 carros",
      "Frutales y zonas verdes",
    ],
    rules: [
      "Check-in flexible y salida antes de las 12:00 p.m.",
      "Se admiten mascotas con tarifa adicional.",
      "El cierre de la casa y activacion de alarma se acuerda con el mayordomo.",
      "Servicio de limpieza y apoyo en cocina disponible con costo adicional.",
      "A partir del huesped 17 aplica tarifa adicional por persona y noche.",
      "Se puede alimentar a las gallinas solo con frutas y verduras.",
      "La pesca puede tener costo adicional y debe coordinarse en la finca.",
    ],
  },
  "finca-anapoima-22-personas": {
    moreInfo: [
      "Finca amplia de aproximadamente 950 m2 distribuida en tres niveles, ideal para grupos grandes.",
      "Cuenta con 7 habitaciones con bano privado y acomodacion en camas para grupos familiares.",
      "En el primer piso hay sala, comedor, bar, billar profesional, cocina, patio, piscina, jacuzzi y bano social.",
      "Tiene una habitacion en primer piso pensada para personas que prefieren evitar escaleras.",
      "El segundo piso reune 6 habitaciones, sala de estar, mirador y sala de fuego.",
      "El kiosco tiene estufa de lena, horno de barro, asador de parrilla y comedor en madera para reuniones.",
    ],
    amenities: [
      "Piscina infinita privada",
      "Jacuzzi privado de gran formato",
      "Vista a la montana y al jardin",
      "Acceso a lago de pesca",
      "Cocina amplia equipada",
      "Wifi en dos redes",
      "Billar profesional",
      "Bar, video beam y telon",
      "Kiosco con cocina de lena, horno y asador",
      "Parqueadero cubierto para hasta 7 carros",
      "Frutales, senderos y zonas verdes",
      "Animales de granja y aves",
    ],
    rules: [
      "Check-in flexible y salida antes de las 12:00 p.m.",
      "Se admiten mascotas con tarifa adicional.",
      "El valor puede variar segun cantidad de huespedes; desde el huesped 17 aplica tarifa adicional por persona y noche.",
      "El cierre de la casa y activacion de alarma se acuerda con el mayordomo.",
      "La finca cuenta con camaras en zonas comunes y entradas por seguridad.",
      "El lago es para contemplacion o pesca; no es apto para banarse.",
      "Se pueden recolectar algunas frutas para consumo durante la estadia.",
    ],
  },
};
