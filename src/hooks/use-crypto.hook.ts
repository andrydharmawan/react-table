import { useBgsCore } from "../contexts/BgsCore.context";
import { encrypt, decrypt, EncryptedPayload, decryptString, encryptString } from "../lib/crypto.util";

export function useCrypto() {
    const { passphrase } = useBgsCore();

    if (!passphrase) throw new Error("Passphrase is required");

    return {
        passphrase,
        encrypt<T>(payload: T) {
            return encrypt(payload, passphrase);
        },
        decrypt<T>(data: EncryptedPayload) {
            return decrypt<T>(data, passphrase);
        },
        encryptString(payload: string) {
            return encryptString(payload, passphrase);
        },
        decryptString(data: string) {
            return decryptString(data, passphrase);
        },
    };
}
