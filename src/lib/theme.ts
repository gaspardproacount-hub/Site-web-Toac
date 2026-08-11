// Génère une surcharge CSS (:root) des couleurs de marque à partir des
// couleurs choisies dans le CMS (Informations → Apparence). Le site utilise
// déjà des variables CSS pour sa palette (voir globals.css, @theme inline) —
// il suffit donc de redéfinir --toac-pink-* / --toac-blue-* pour que la
// couleur se propage partout où elle est utilisée, sans toucher au code des
// pages/composants.
//
// Une seule couleur est choisie par teinte (le rose principal, le bleu
// principal) ; les nuances plus claires/foncées de cette teinte sont
// régénérées automatiquement en conservant les écarts de luminosité mesurés
// sur la palette d'origine, pour rester cohérent sans demander à l'utilisateur
// de régler 10 nuances à la main.

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// Écart de luminosité (points de %) entre chaque nuance et la nuance de
// référence choisie dans le CMS, mesuré sur la palette d'origine.
const BLUE_LIGHTNESS_DELTA: Record<string, number> = {
  "950": 0,
  "900": 4.5,
  "800": 11.3,
  "700": 17.6,
  "600": 25.1,
  "500": 33.3,
};
const PINK_LIGHTNESS_DELTA: Record<string, number> = {
  "600": -7.2,
  "500": 0,
  "400": 13.6,
  "300": 32.8,
};

function buildRamp(baseHex: string, deltas: Record<string, number>, prefix: string): string {
  const [h, s, l] = hexToHsl(baseHex);
  return Object.entries(deltas)
    .map(([shade, delta]) => `--toac-${prefix}-${shade}: ${hslToHex(h, s, clamp(l + delta, 2, 96))};`)
    .join(" ");
}

/**
 * Construit le CSS de surcharge (:root { ... }) à injecter dans <head>.
 * Renvoie null si rien n'est configuré côté CMS (le site garde alors sa
 * palette par défaut, définie dans globals.css).
 */
export function buildThemeCss(theme?: { pink?: string; blue?: string } | null): string | null {
  if (!theme) return null;
  const parts: string[] = [];
  if (theme.pink && HEX_PATTERN.test(theme.pink)) {
    parts.push(buildRamp(theme.pink, PINK_LIGHTNESS_DELTA, "pink"));
  }
  if (theme.blue && HEX_PATTERN.test(theme.blue)) {
    parts.push(buildRamp(theme.blue, BLUE_LIGHTNESS_DELTA, "blue"));
  }
  if (!parts.length) return null;
  return `:root { ${parts.join(" ")} }`;
}
