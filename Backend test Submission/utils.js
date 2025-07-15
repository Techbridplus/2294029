"use strict";
// backend-test-submission/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortcode = generateShortcode;
exports.isValidShortcode = isValidShortcode;
exports.isValidUrl = isValidUrl;
function generateShortcode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function isValidShortcode(code) {
    return /^[a-zA-Z0-9]{4,16}$/.test(code); // Alphanumeric, 4-16 chars
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}
