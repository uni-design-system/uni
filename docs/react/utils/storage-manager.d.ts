export interface StorageManager<T> {
    type: 'cookie' | 'localStorage';
    get(init?: T): T | undefined;
    set(value: T): void;
}
export declare const createLocalStorageManager: <T>(key: string) => StorageManager<T>;
export declare const createCookieStorageManager: (key: string, cookie?: string) => StorageManager<string>;
//# sourceMappingURL=storage-manager.d.ts.map