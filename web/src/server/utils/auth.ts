import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
    password: string,
    salt: string,
    keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export const VT_EMAIL_DOMAIN = "@vt.edu";

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export function isVtEmail(email: string) {
    return normalizeEmail(email).endsWith(VT_EMAIL_DOMAIN);
}

// Stored as "salt:hash", both hex
export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = await scryptAsync(password, salt, KEY_LENGTH);
    return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scryptAsync(password, salt, KEY_LENGTH);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
