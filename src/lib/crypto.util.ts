import CryptoJS from "crypto-js";

export type EncryptedPayload = {
    salt: string;
    iv: string;
    encrypted: string;
};

export function encrypt<T = unknown>(payload: T, passphrase: string): EncryptedPayload {
    const salt = CryptoJS.lib.WordArray.random(16);
    const iv = CryptoJS.lib.WordArray.random(16);

    const key = CryptoJS.PBKDF2(passphrase, salt, {
        keySize: 256 / 32,
        iterations: 1000,
    });

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, { iv }).toString();

    return {
        salt: salt.toString(CryptoJS.enc.Base64),
        iv: iv.toString(CryptoJS.enc.Base64),
        encrypted,
    };
}

export function decrypt<T = unknown>(cipherPayload: EncryptedPayload, passphrase: string): T {
    const { salt, iv, encrypted } = cipherPayload;

    const key = CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Base64.parse(salt), {
        keySize: 256 / 32,
        iterations: 1000,
    });

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: CryptoJS.enc.Base64.parse(iv),
    });

    const plainText = decrypted.toString(CryptoJS.enc.Utf8);

    return JSON.parse(plainText);
}

export function encryptString(plain: string, passphrase: string): string {
    return JSON.stringify(encrypt(plain, passphrase));
}

export function decryptString(encryptedJson: string, passphrase: string): string {
    return decrypt<string>(JSON.parse(encryptedJson), passphrase);
}