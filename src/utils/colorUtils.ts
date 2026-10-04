import { KelvinPreset } from '../types/torch';

/**
 * Converts Kelvin color temperature (1000K to 12000K) to RGB
 * Based on Tanner Helland's algorithm
 */
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number; hex: string } {
  const temp = Math.max(1000, Math.min(12000, kelvin)) / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  const red = Math.round(r);
  const green = Math.round(g);
  const blue = Math.round(b);
  const hex = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

  return { r: red, g: green, b: blue, hex };
}

export const KELVIN_PRESETS: KelvinPreset[] = [
  {
    name: 'Candle Glow',
    kelvin: 1900,
    description: 'Deep amber incandescent warmth',
    colorHex: '#ff9329',
  },
  {
    name: 'Warm Tungsten',
    kelvin: 2800,
    description: 'Cozy living room illumination',
    colorHex: '#ffb46b',
  },
  {
    name: 'Natural Studio',
    kelvin: 4200,
    description: 'Balanced neutral photography tint',
    colorHex: '#ffe0b5',
  },
  {
    name: 'Solar Daylight',
    kelvin: 5600,
    description: 'Pure midday sun spectral balance',
    colorHex: '#fff4e5',
  },
  {
    name: 'Arctic Xenon',
    kelvin: 7500,
    description: 'High-contrast crystalline beam',
    colorHex: '#e4ecff',
  },
  {
    name: 'Tactical Red',
    kelvin: 1200,
    description: 'Rhodopsin-preserving night vision',
    colorHex: '#ff2a2a',
    isSpecial: true,
  },
  {
    name: 'UV Cobalt',
    kelvin: 11000,
    description: 'Ultraviolet trace fluorescence',
    colorHex: '#5e72ff',
    isSpecial: true,
  },
];
