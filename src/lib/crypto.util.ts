import AES from "crypto-js/aes";
import PBKDF2 from "crypto-js/pbkdf2";
import Utf8 from "crypto-js/enc-utf8";
import Base64 from "crypto-js/enc-base64";
import WordArray from "crypto-js/lib-typedarrays";

export type EncryptedPayload = {
    salt: string;
    iv: string;
    encrypted: string;
};

export function encrypt<T = unknown>(payload: T, passphrase: string): EncryptedPayload {
    const salt = WordArray.random(16);
    const iv = WordArray.random(16);

    const key = PBKDF2(passphrase, salt, {
        keySize: 256 / 32,
        iterations: 1000,
    });

    const encrypted = AES.encrypt(JSON.stringify(payload), key, { iv }).toString();

    return {
        salt: salt.toString(Base64),
        iv: iv.toString(Base64),
        encrypted,
    };
}

export function decrypt<T = unknown>(cipherPayload: EncryptedPayload, passphrase: string): T {
    const { salt, iv, encrypted } = cipherPayload;

    const key = PBKDF2(passphrase, Base64.parse(salt), {
        keySize: 256 / 32,
        iterations: 1000,
    });

    const decrypted = AES.decrypt(encrypted, key, {
        iv: Base64.parse(iv),
    });

    const plainText = decrypted.toString(Utf8);
    return JSON.parse(plainText);
}

export function encryptString(plain: string, passphrase: string): string {
    return JSON.stringify(encrypt(plain, passphrase));
}

export function decryptString(encryptedJson: string, passphrase: string): string {
    return decrypt<string>(JSON.parse(encryptedJson), passphrase);
}