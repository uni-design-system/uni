export const CommonControlExcludes = [
  'style',
  'theme', // Base Component Property
  'themeService',
  'click',
  'init',
  'ngOnInit',
  'ngOnChanges',
  'getToken',
  '_path',
  'className',
  'setClassName',
  'ngOnDestroy',
  'componentName', // Base Component Property
  'componentOptions', // Base Component Property
  'componentTheme', // Base Component Property
];

/**
 * A pure function to transparentize any hex or rgba string.
 * @param {number} amount - Amount to reduce opacity (0 to 1).
 * @param {string} color - Hex (#fff, #ffffff) or rgba/rgb string.
 * @returns {string} - The resulting rgba string.
 */
export const transparentize = (amount: number, color: string): string => {
  let r: number;
  let g: number;
  let b: number;
  let a = 1;

  if (color.startsWith('#')) {
    // Strategy: Normalize Hex
    let hex = color.replace('#', '');

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    // Strategy: Extract numeric values using Regex
    const match = color.match(/\d+(\.\d+)?/g);

    if (!match) {
      throw new Error(`Invalid color format: ${color}`);
    }

    const values = match.map(Number);
    [r, g, b] = values;

    // If rgba, use the 4th value; otherwise default to 1
    a = values.length === 4 ? values[3] : 1;
  } else {
    throw new Error(`Unsupported color format: ${color}. Use Hex or RGB(A).`);
  }

  // Calculate new alpha: Current Alpha - Amount
  // Math.max/min ensures we stay within the 0-1 range
  const newAlpha = parseFloat(Math.max(0, Math.min(1, a - amount)).toFixed(3));

  return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
};
