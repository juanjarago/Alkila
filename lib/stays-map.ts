// lib/stays-map.ts
export const STAYS_LISTING_ID_MAP: Record<string, string> = {
  JF08: "6671fcf283f5440237f5058f", // Cabaña 8
  JF06: "6671ff4283f5440237f54aa5", // Casa 16
  JF02: "669c05fb930a3f38680ebda",  // Finca 22
};

export function resolveStaysListingId(inputId: string): string {
  const trimmed = inputId.trim();

  // Si ya viene un ObjectId válido, lo devolvemos tal cual
  if (/^[a-f0-9]{24}$/.test(trimmed)) return trimmed;

  // Si viene JFxx, lo traducimos
  const mapped = STAYS_LISTING_ID_MAP[trimmed];
  if (!mapped) {
    throw new Error(`Unknown listing id: "${inputId}"`);
  }
  return mapped;
}
