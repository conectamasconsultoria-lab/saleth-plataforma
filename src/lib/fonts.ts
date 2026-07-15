import { Inter, Space_Grotesk, Playfair_Display, Poppins, Fraunces, Bebas_Neue } from "next/font/google";

// Fuente de titulares curada por identidad de marca. El cuerpo de texto
// siempre queda en Inter (heredado del layout) para mantener legibilidad
// a tamaños chicos; solo el titular y el número de paso cambian de fuente.
const inter = Inter({ subsets: ["latin"], weight: ["600", "900"] });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "800"] });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });

export type BrandFontId = "inter" | "grotesk" | "playfair" | "poppins" | "fraunces" | "bebas";

export type BrandFontDef = {
  id: BrandFontId;
  label: string;
  vibe: string;
  family: string;
  weight: number;
  lineHeight: number;
  uppercase?: boolean;
};

export const BRAND_FONTS: Record<BrandFontId, BrandFontDef> = {
  inter: {
    id: "inter",
    label: "Inter",
    vibe: "Moderno y neutro",
    family: inter.style.fontFamily,
    weight: 900,
    lineHeight: 1.22,
  },
  grotesk: {
    id: "grotesk",
    label: "Space Grotesk",
    vibe: "Bold y tech",
    family: grotesk.style.fontFamily,
    weight: 700,
    lineHeight: 1.2,
  },
  playfair: {
    id: "playfair",
    label: "Playfair Display",
    vibe: "Editorial y elegante",
    family: playfair.style.fontFamily,
    weight: 900,
    lineHeight: 1.28,
  },
  poppins: {
    id: "poppins",
    label: "Poppins",
    vibe: "Cercano y amigable",
    family: poppins.style.fontFamily,
    weight: 800,
    lineHeight: 1.24,
  },
  fraunces: {
    id: "fraunces",
    label: "Fraunces",
    vibe: "Cálido y premium",
    family: fraunces.style.fontFamily,
    weight: 700,
    lineHeight: 1.26,
  },
  bebas: {
    id: "bebas",
    label: "Bebas Neue",
    vibe: "Impacto y energía",
    family: bebas.style.fontFamily,
    weight: 400,
    lineHeight: 1.05,
    uppercase: true,
  },
};

export const BRAND_FONT_LIST = Object.values(BRAND_FONTS);

export function resolveBrandFont(id?: string | null): BrandFontDef {
  return BRAND_FONTS[(id as BrandFontId) ?? "inter"] ?? BRAND_FONTS.inter;
}
