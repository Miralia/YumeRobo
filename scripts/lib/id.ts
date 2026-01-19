/**
 * ID Generation utilities
 */
import { nanoid } from 'nanoid';

/**
 * Generate a unique slug for a release
 * Uses nanoid with custom alphabet (lowercase + numbers, no ambiguous chars)
 */
export function generateSlug(length: number = 8): string {
    const alphabet = 'abcdefghijkmnopqrstuvwxyz23456789'; // No l, o, 0, 1
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
}

/**
 * Generate a nanoid (for internal use)
 */
export function generateId(length: number = 10): string {
    return nanoid(length);
}

/**
 * Create a slug from a title (simplified)
 */
export function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}
