import { useCallback, useEffect, useState } from "react";
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

    const get = <T = any>(key: string) => {
        const [value, setValue] = useState<T | null>(() => {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return null;
                return decrypt(JSON.parse(raw));
            } catch (e) {
                console.error("Failed to parse localStorage value", e);
                return null;
            }
        });

        useEffect(() => {
            const handler = (event: StorageEvent) => {
                if (event.key === key) {
                    if (event.newValue) {
                        try {
                            setValue(decrypt(JSON.parse(event.newValue)));
                        } catch (e) {
                            console.error("Decrypt error from storage event", e);
                        }
                    } else {
                        setValue(null);
                    }
                }
            };

            window.addEventListener("storage", handler);
            return () => window.removeEventListener("storage", handler);
        }, [key, decrypt]);

        return value;
    };

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
