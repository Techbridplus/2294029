"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Logging_Middleware_1 = require("../Logging Middleware");
const urlStore_1 = require("./urlStore");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const CLIENT_ID = 'eb8e4a55-794b-42b3-b464-b06be36cd654';
const CLIENT_SECRET = 'PQGhgVpAxqwzbnVE';
const token = ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnYXVyYXZqb3NoaWFhMUBnbWFpbC5jb20iLCJleHAiOjE3NTI1NTc4MzIsImlhdCI6MTc1MjU1NjkzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImYxMTljMTQxLTcyZDYtNGQ0NC05YzU3LTVkMzMxYWI3ZTU2NSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImdhdXJhdiBqb3NoaSIsInN1YiI6ImViOGU0YTU1LTc5NGItNDJiMy1iNDY0LWIwNmJlMzZjZDY1NCJ9LCJlbWFpbCI6ImdhdXJhdmpvc2hpYWExQGdtYWlsLmNvbSIsIm5hbWUiOiJnYXVyYXYgam9zaGkiLCJyb2xsTm8iOiIyMjk0MDI5IiwiYWNjZXNzQ29kZSI6IlFBaERVciIsImNsaWVudElEIjoiZWI4ZTRhNTUtNzk0Yi00MmIzLWI0NjQtYjA2YmUzNmNkNjU0IiwiY2xpZW50U2VjcmV0IjoiUFFHaGdWcEF4cXd6Ym5WRSJ9.lXnXNP79VmcG-nVvl43OyQOtVaxtxu0FZT1IVSoN98Y';
const HOSTNAME = 'http://localhost:3000';
// POST /shorturls
app.post('/shorturls', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, validity, shortcode } = req.body;
    // Validate URL
    if (!url || !(0, utils_1.isValidUrl)(url)) {
        yield (0, Logging_Middleware_1.Log)({
            stack: 'backend',
            level: 'error',
            package: 'handler',
            message: 'Invalid or missing URL in request',
            accessToken: token
        });
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }
    // Validate or generate shortcode
    let code = shortcode;
    if (code) {
        if (!(0, utils_1.isValidShortcode)(code)) {
            yield (0, Logging_Middleware_1.Log)({
                stack: 'backend',
                level: 'error',
                package: 'handler',
                message: 'Invalid custom shortcode',
                accessToken: token
            });
            return res.status(400).json({ error: 'Invalid custom shortcode' });
        }
        if ((0, urlStore_1.getShortUrl)(code)) {
            yield (0, Logging_Middleware_1.Log)({
                stack: 'backend',
                level: 'error',
                package: 'handler',
                message: 'Shortcode already exists',
                accessToken: token
            });
            return res.status(409).json({ error: 'Shortcode already exists' });
        }
    }
    else {
        // Generate unique shortcode
        do {
            code = (0, utils_1.generateShortcode)();
        } while ((0, urlStore_1.getShortUrl)(code));
    }
    // Validity
    const validMinutes = typeof validity === 'number' && validity > 0 ? validity : 30;
    const now = new Date();
    const expiry = new Date(now.getTime() + validMinutes * 60000);
    // Store
    (0, urlStore_1.createShortUrl)(code, {
        originalUrl: url,
        createdAt: now,
        expiry,
        clicks: [],
    });
    yield (0, Logging_Middleware_1.Log)({
        stack: 'backend',
        level: 'info',
        package: 'handler',
        message: `Short URL created: ${code} for ${url}`,
        accessToken: token
    });
    return res.status(201).json({
        shortLink: `${HOSTNAME}/${code}`,
        expiry: expiry.toISOString(),
    });
}));
// GET /shorturls/:shortcode (stats)
app.get('/shorturls/:shortcode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortcode } = req.params;
    const data = (0, urlStore_1.getShortUrl)(shortcode);
    if (!data) {
        yield (0, Logging_Middleware_1.Log)({
            stack: 'backend',
            level: 'error',
            package: 'handler',
            message: `Shortcode not found: ${shortcode}`,
            accessToken: token
        });
        return res.status(404).json({ error: 'Shortcode not found' });
    }
    // Expiry check
    if (data.expiry < new Date()) {
        yield (0, Logging_Middleware_1.Log)({
            stack: 'backend',
            level: 'warn',
            package: 'handler',
            message: `Shortcode expired: ${shortcode}`,
            accessToken: token
        });
        return res.status(410).json({ error: 'Shortcode expired' });
    }
    yield (0, Logging_Middleware_1.Log)({
        stack: 'backend',
        level: 'info',
        package: 'handler',
        message: `Stats retrieved for shortcode: ${shortcode}`,
        accessToken: token
    });
    return res.json({
        originalUrl: data.originalUrl,
        createdAt: data.createdAt,
        expiry: data.expiry,
        totalClicks: data.clicks.length,
        clicks: data.clicks,
    });
}));
// GET /:shortcode (redirect)
app.get('/:shortcode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortcode } = req.params;
    const data = (0, urlStore_1.getShortUrl)(shortcode);
    if (!data) {
        yield (0, Logging_Middleware_1.Log)({
            stack: 'backend',
            level: 'error',
            package: 'handler',
            message: `Shortcode not found: ${shortcode}`,
            accessToken: token
        });
        return res.status(404).json({ error: 'Shortcode not found' });
    }
    // Expiry check
    if (data.expiry < new Date()) {
        yield (0, Logging_Middleware_1.Log)({
            stack: 'backend',
            level: 'warn',
            package: 'handler',
            message: `Shortcode expired: ${shortcode}`,
            accessToken: token
        });
        return res.status(410).json({ error: 'Shortcode expired' });
    }
    // Log click
    (0, urlStore_1.incrementClick)(shortcode, req.get('referer') || null, null); // geo: null for now
    yield (0, Logging_Middleware_1.Log)({
        stack: 'backend',
        level: 'info',
        package: 'handler',
        message: `Redirected for shortcode: ${shortcode}`,
        accessToken: token
    });
    return res.redirect(data.originalUrl);
}));
app.listen(3000, () => {
    console.log('URL Shortener running on port 3000');
});
