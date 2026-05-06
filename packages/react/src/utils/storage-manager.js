// Usage
// export const localStorageManager = createLocalStorageManager(STORAGE_KEY);
export const createLocalStorageManager = (key) => ({
    type: 'localStorage',
    get(init) {
        if (!globalThis?.document)
            return init;
        let value;
        try {
            value = localStorage.getItem(key) || init;
        }
        catch (e) {
            // no op
        }
        return JSON.parse(value) || init;
    },
    set(value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            // no op
        }
    },
});
const parseCookie = (cookie, key) => {
    const match = cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match?.[2];
};
// Usage
// export const cookieStorageManager = createCookieStorageManager(STORAGE_KEY);
export const createCookieStorageManager = (key, cookie) => ({
    type: 'cookie',
    get(init) {
        if (cookie)
            return parseCookie(cookie, key);
        if (!globalThis?.document)
            return init;
        return parseCookie(document.cookie, key) || init;
    },
    set(value) {
        document.cookie = `${key}=${value}; max-age=31536000; path=/`;
    },
});
