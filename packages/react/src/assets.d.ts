/**
 * Side-effect imports of style and asset files. TypeScript 6 (TS2882) requires
 * a declaration for these rather than resolving them implicitly; the bundler
 * handles the actual loading.
 */
declare module '*.css';
declare module '*.scss';
declare module '*.svg';
