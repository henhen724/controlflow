"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoginSession = exports.setLoginSession = void 0;
const iron_1 = __importDefault(require("@hapi/iron"));
const auth_cookies_1 = require("./auth-cookies");
const TOKEN_SECRET = process.env.TOKEN_SECRET;
if (!TOKEN_SECRET)
    throw Error("Token secret is not intialized.");
async function setLoginSession(res, session) {
    const createdAt = Date.now();
    // Create a session object with a max age that we can validate later
    const obj = Object.assign(Object.assign({}, session), { createdAt, maxAge: auth_cookies_1.MAX_AGE });
    const token = await iron_1.default.seal(obj, TOKEN_SECRET, iron_1.default.defaults);
    auth_cookies_1.setTokenCookie(res, token);
}
exports.setLoginSession = setLoginSession;
async function getLoginSession(req) {
    if (!req)
        return;
    const token = auth_cookies_1.getTokenCookie(req);
    if (!token)
        return;
    const session = await iron_1.default.unseal(token, TOKEN_SECRET, iron_1.default.defaults);
    const expiresAt = session.createdAt + session.maxAge * 1000;
    // Validate the expiration date of the session
    if (Date.now() < expiresAt) {
        return session;
    }
}
exports.getLoginSession = getLoginSession;
