import { useCallback } from "react";
import { useCrypto } from "./use-crypto.hook";

export const useStorage = () => {
    const { encrypt, decrypt } = useCrypto();

    const save = useCallback(<T = any>(key: string, data: T) => {
        try {
            const raw = encrypt(data);
            localStorage.setItem(key, JSON.stringify(raw));
        } catch (e) {
            console.error("Failed to save to storage:", e);
        }
    }, [encrypt]);

    const get = useCallback(<T = any>(key: string): T | null => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return decrypt(JSON.parse(raw));
        } catch (e) {
            console.error("Failed to get from storage:", e);
            return null;
        }
    }, [decrypt]);

    const clear = useCallback((key?: string) => {
        if (key) {
            localStorage.removeItem(key);
        }
        else {
            localStorage.clear();
        }
    }, []);

    return { save, get, clear };
};
