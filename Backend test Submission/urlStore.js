"use strict";
// backend-test-submission/urlStore.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShortUrl = createShortUrl;
exports.getShortUrl = getShortUrl;
exports.incrementClick = incrementClick;
const urlMap = new Map();
function createShortUrl(shortcode, data) {
    urlMap.set(shortcode, data);
}
function getShortUrl(shortcode) {
    return urlMap.get(shortcode);
}
function incrementClick(shortcode, referrer, geo) {
    const data = urlMap.get(shortcode);
    if (data) {
        data.clicks.push({ timestamp: new Date(), referrer, geo });
    }
}
