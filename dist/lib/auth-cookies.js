"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenCookie = exports.parseCookies = exports.removeTokenCookie = exports.setTokenCookie = exports.MAX_AGE = void 0;
const cookie_1 = require("cookie");
const TOKEN_NAME = 'controlflow_token';
exports.MAX_AGE = 60 * 60 * 8; // 8 hours
function setTokenCookie(res, token) {
    const cookie = cookie_1.serialize(TOKEN_NAME, token, {
        maxAge: exports.MAX_AGE,
        expires: new Date(Date.now() + exports.MAX_AGE * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });
    res.setHeader('Set-Cookie', cookie);
}
exports.setTokenCookie = setTokenCookie;
function removeTokenCookie(res) {
    const cookie = cookie_1.serialize(TOKEN_NAME, '', {
        maxAge: -1,
        path: '/',
    });
    res.setHeader('Set-Cookie', cookie);
}
exports.removeTokenCookie = removeTokenCookie;
function parseCookies(req) {
    var _a;
    // For API Routes we don't need to parse the cookies.
    if (req === null || req === void 0 ? void 0 : req.cookies)
        return req.cookies;
    // For pages we do need to parse the cookies.
    const cookie = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.cookie;
    try {
        return cookie_1.parse(cookie || '');
    }
    catch (err) {
        console.log(err);
        return;
    }
}
exports.parseCookies = parseCookies;
function getTokenCookie(req) {
    const cookies = parseCookies(req);
    if (!cookies)
        return;
    return cookies[TOKEN_NAME];
}
exports.getTokenCookie = getTokenCookie;
