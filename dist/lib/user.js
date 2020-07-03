"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.createUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.createUser = (data) => {
    const salt = crypto_1.default.randomBytes(16).toString('hex');
    const hash = crypto_1.default
        .pbkdf2Sync(data.password, salt, 1000, 64, 'sha512')
        .toString('hex');
    const user = {
        id: new mongoose_1.default.Types.ObjectId,
        createdAt: Date.now(),
        email: data.email,
        hash,
        salt,
    };
    return user;
};
exports.validatePassword = (user, inputPassword) => {
    const inputHash = crypto_1.default
        .pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512')
        .toString('hex');
    const passwordsMatch = user.hash === inputHash;
    return passwordsMatch;
};
