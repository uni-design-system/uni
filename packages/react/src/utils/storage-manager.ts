export interface StorageManager<T> {
  type: 'cookie' | 'localStorage';
  get(init?: T): T | undefined;
  set(value: T): void;
}

// Usage
// export const localStorageManager = createLocalStorageManager(STORAGE_KEY);
export const createLocalStorageManager = <T>(key: string): StorageManager<T> => ({
  type: 'localStorage',
  get(init?) {
    if (!globalThis?.document) return init;
    let value: any;
    try {
      value = localStorage.getItem(key) || init;
    } catch (e) {
      // no op
    }

    return JSON.parse(value) || init;
  },
  set(value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // no op
    }
  },
});

const parseCookie = (cookie: string, key: string): string | undefined => {
  const match = cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
  return match?.[2];
};

// Usage
// export const cookieStorageManager = createCookieStorageManager(STORAGE_KEY);
export const createCookieStorageManager = (key: string, cookie?: string): StorageManager<string> => ({
  type: 'cookie',
  get(init?): string | undefined {
    if (cookie) return parseCookie(cookie, key);
    if (!globalThis?.document) return init;
    return parseCookie(document.cookie, key) || init;
  },
  set(value) {
    document.cookie = `${key}=${value}; max-age=31536000; path=/`;
  },
});
