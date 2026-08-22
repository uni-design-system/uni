export const safeParseInt = (n: string | number) => (typeof n === 'number' ? n : parseInt(n));
