"use strict";
// backend-test-submission/utils.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortcode = generateShortcode;
exports.isValidShortcode = isValidShortcode;
exports.isValidUrl = isValidUrl;
exports.fetchAccessToken = fetchAccessToken;
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
function fetchAccessToken(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, name, rollNo, accessCode, clientID, clientSecret, }) {
        try {
            const response = yield fetch('http://20.244.56.144/evaluation-service/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name,
                    rollNo,
                    accessCode,
                    clientID,
                    clientSecret,
                }),
            });
            if (!response.ok) {
                console.error('Failed to fetch access token:', yield response.text());
                return null;
            }
            const data = yield response.json();
            // Assuming the token is in data.accessToken
            return data.access_token;
        }
        catch (err) {
            console.error('Error fetching access token:', err);
            return null;
        }
    });
}
