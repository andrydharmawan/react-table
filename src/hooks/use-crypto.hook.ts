import { useBgsCore } from "../contexts/BgsCore.context";
import { encrypt, decrypt, EncryptedPayload, decryptString, encryptString } from "../lib/crypto.util";

export function useCrypto() {
    const { passphrase } = useBgsCore();

    return {
        passphrase,
        encrypt<T>(payload: T, passphraseProps?: string) {
            if (!passphrase || !passphraseProps) throw new Error("Passphrase is required");
            return encrypt(payload, passphraseProps || passphrase);
        },
        decrypt<T>(data: EncryptedPayload, passphraseProps?: string) {
            if (!passphrase || !passphraseProps) throw new Error("Passphrase is required");
            return decrypt<T>(data, passphraseProps || passphrase);
        },
        encryptString(payload: string, passphraseProps?: string) {
            if (!passphrase || !passphraseProps) throw new Error("Passphrase is required");
            return encryptString(payload, passphraseProps || passphrase);
        },
        decryptString(data: string, passphraseProps?: string) {
            if (!passphrase || !passphraseProps) throw new Error("Passphrase is required");
            return decryptString(data, passphraseProps || passphrase);
        },
    };
}
