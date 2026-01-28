import manifest from "./gallery-manifest.json";

type Manifest = {
  properties: { slug: string; images: string[] }[];
};

export function getImagesBySlug(slug: string): string[] {
  const m = manifest as Manifest;
  return m.properties.find((p) => p.slug === slug)?.images ?? [];
}
