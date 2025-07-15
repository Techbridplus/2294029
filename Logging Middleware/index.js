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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const LOG_URL = 'http://20.244.56.144/evaluation-service/logs';
function Log(_a) {
    return __awaiter(this, arguments, void 0, function* ({ stack, level, package: pkg, message, accessToken }) {
        try {
            const response = yield fetch(LOG_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    stack,
                    level,
                    package: pkg,
                    message,
                }),
            });
            if (!response.ok) {
                const errorText = yield response.text();
                console.error('Failed to log:', errorText);
            }
            else {
                const data = yield response.json();
                return data;
            }
        }
        catch (err) {
            console.error('Error sending log:', err);
        }
    });
}
