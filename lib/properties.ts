export type Property = {
  slug: string;
  title: string;
  shortTitle: string;
  staysListingId?: string;
  requiresCalendarSync?: boolean;
  bookingFrom?: string;
  bookingThrough?: string;
  availableExtras?: string[];
  capacity: number;
  rooms: number;
  baths: number;
  locationLabel: string;
  heroImage: string;
  images?: string[];
  highlights: string[];
  petFriendly: boolean;
  privatePool: boolean;
  privateJacuzzi: boolean;
  description: string;
  airbnbUrl?: string;
  airbnbRating?: number;
  airbnbReviewCount?: number;
  airbnbHostYears?: number;
};

export const properties: Property[] = [
  {
    slug: "casa-david-apulo-13-personas",
    title: "Casa David en Apulo para 13 personas con piscina privada",
    shortTitle: "Casa David (hasta 13)",
    capacity: 13,
    rooms: 4,
    baths: 4.5,
    locationLabel: "Apulo · Cundinamarca",
    heroImage: "/images/properties/casa-david-apulo-13-personas/01.webp",
    images: Array.from({ length: 25 }, (_, i) =>
      `/images/properties/casa-david-apulo-13-personas/${String(i + 1).padStart(2, "0")}.webp`
    ),
    highlights: ["Piscina privada", "4 habitaciones", "Billar y arcade", "BBQ y ahumador", "Mascotas (tarifa adicional)"],
    petFriendly: true,
    privatePool: true,
    privateJacuzzi: false,
    description: "Casa moderna en Apulo para compartir en familia o con amigos. Tiene piscina privada, kiosco con billar y máquina arcade, y zona BBQ con parrilla y ahumador. Sus cuatro habitaciones, cocina abierta, balcones con vista a las montañas y jardines ofrecen un espacio privado para descansar en clima cálido.",
    airbnbUrl: "https://www.airbnb.com.co/rooms/1816839560642450342",
    requiresCalendarSync: true,
    bookingFrom: "2026-11-13",
    bookingThrough: "2027-04-28",
    availableExtras: ["pets"],
  },
  {
    slug: "cabana-privada-anapoima-8-personas",
    title: "Cabaña privada en Anapoima para 8 personas con piscina y jacuzzi",
    shortTitle: "Cabaña privada (hasta 8)",
    staysListingId: "6671fcf283f5440237f5058f",
    capacity: 8,
    rooms: 2,
    baths: 3,
    locationLabel: "Anapoima · Vereda Las Mercedes",
    heroImage: "/images/properties/cabana-privada-anapoima-8-personas/01.webp",
    images: [
      "/images/properties/cabana-privada-anapoima-8-personas/01.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/02.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/03.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/04.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/05.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/06.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/07.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/08.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/09.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/10.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/11.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/12.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/13.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/14.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/15.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/16.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/17.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/18.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/19.webp",
      "/images/properties/cabana-privada-anapoima-8-personas/20.webp",
    ],
    highlights: [
      "Piscina privada",
      "Jacuzzi privado",
      "BBQ y cocina de leña",
      "Internet",
      "Mascotas (tarifa adicional)",
    ],
    petFriendly: true,
    privatePool: true,
    privateJacuzzi: true,
    description:
      "Cabaña privada ideal para familias pequeñas o amigos. Piscina y jacuzzi privados, BBQ con cocina de leña, internet y un entorno natural rodeado de frutales.",
    airbnbUrl: "https://www.airbnb.com.co/rooms/50155196",
    airbnbRating: 4.59,
    airbnbReviewCount: 95,
    airbnbHostYears: 8,
  },
  {
    slug: "casa-campestre-anapoima-16-personas",
    title: "Casa campestre en Anapoima para 16 personas con piscina y jacuzzi",
    shortTitle: "Casa campestre (hasta 16)",
    staysListingId: "6671ff4283f5440237f54aa5",
    capacity: 16,
    rooms: 4,
    baths: 5,
    locationLabel: "Anapoima · Vereda Las Mercedes",
    heroImage: "/images/properties/casa-campestre-anapoima-16-personas/05.webp",
    images: [
      "/images/properties/casa-campestre-anapoima-16-personas/05.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/01.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/02.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/03.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/04.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/06.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/07.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/08.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/09.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/10.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/11.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/12.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/13.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/14.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/15.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/16.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/17.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/18.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/19.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/20.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/21.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/22.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/23.webp",
      "/images/properties/casa-campestre-anapoima-16-personas/24.webp",
    ],
    highlights: [
      "Piscina privada",
      "Jacuzzi privado",
      "Aire acondicionado",
      "BBQ y cocina de leña",
      "Mascotas (tarifa adicional)",
    ],
    petFriendly: true,
    privatePool: true,
    privateJacuzzi: true,
    description:
      "Casa campestre amplia para familias y grupos de amigos. Piscina/jacuzzi privados, BBQ con cocina de leña, A/C y habitaciones cómodas.",
    airbnbUrl: "https://www.airbnb.com.co/rooms/1141337700316872045",
    airbnbRating: 4.85,
    airbnbReviewCount: 47,
    airbnbHostYears: 8,
  },
  {
    slug: "finca-anapoima-22-personas",
    title: "Finca en Anapoima para 24 personas con piscina, jacuzzi y zonas sociales",
    shortTitle: "Finca grande (hasta 24)",
    staysListingId: "669c05fb930a3f38680ebda",
    capacity: 24,
    rooms: 7,
    baths: 8,
    locationLabel: "Anapoima · Vereda Las Mercedes",
    heroImage: "/images/properties/finca-anapoima-22-personas/20.webp",
    images: [
      "/images/properties/finca-anapoima-22-personas/20.webp",
      "/images/properties/finca-anapoima-22-personas/01.webp",
      "/images/properties/finca-anapoima-22-personas/02.webp",
      "/images/properties/finca-anapoima-22-personas/03.webp",
      "/images/properties/finca-anapoima-22-personas/04.webp",
      "/images/properties/finca-anapoima-22-personas/05.webp",
      "/images/properties/finca-anapoima-22-personas/06.webp",
      "/images/properties/finca-anapoima-22-personas/07.webp",
      "/images/properties/finca-anapoima-22-personas/08.webp",
      "/images/properties/finca-anapoima-22-personas/09.webp",
      "/images/properties/finca-anapoima-22-personas/10.webp",
      "/images/properties/finca-anapoima-22-personas/11.webp",
      "/images/properties/finca-anapoima-22-personas/12.webp",
      "/images/properties/finca-anapoima-22-personas/13.webp",
      "/images/properties/finca-anapoima-22-personas/14.webp",
      "/images/properties/finca-anapoima-22-personas/15.webp",
      "/images/properties/finca-anapoima-22-personas/16.webp",
      "/images/properties/finca-anapoima-22-personas/17.webp",
      "/images/properties/finca-anapoima-22-personas/18.webp",
      "/images/properties/finca-anapoima-22-personas/19.webp",
      "/images/properties/finca-anapoima-22-personas/21.webp",
      "/images/properties/finca-anapoima-22-personas/22.webp",
      "/images/properties/finca-anapoima-22-personas/23.webp",
      "/images/properties/finca-anapoima-22-personas/24.webp",
      "/images/properties/finca-anapoima-22-personas/25.webp",
      "/images/properties/finca-anapoima-22-personas/26.webp",
      "/images/properties/finca-anapoima-22-personas/27.webp",
      "/images/properties/finca-anapoima-22-personas/28.webp",
    ],
    highlights: [
      "Piscina privada",
      "Jacuzzi privado",
      "Billar",
      "Kiosco con cocina de leña",
      "Lago de pesca",
      "Mascotas (tarifa adicional)",
    ],
    petFriendly: true,
    privatePool: true,
    privateJacuzzi: true,
    description:
      "Finca ideal para reuniones grandes. Piscina/jacuzzi privados, billar, kiosco con cocina de leña y amplias zonas verdes para compartir.",
    airbnbUrl: "https://www.airbnb.com.co/rooms/32492341",
    airbnbRating: 4.83,
    airbnbReviewCount: 138,
    airbnbHostYears: 8,
  },
];
