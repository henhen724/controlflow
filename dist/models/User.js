"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Defining the typescript interfaces which user will use.
const UserSchema = new mongoose_1.default.Schema({
    id: {
        type: mongoose_1.default.Types.ObjectId,
        required: [true, 'This user needs an object id.']
    },
    hash: {
        type: String,
        required: [true, 'User needs a password hash.']
    },
    salt: {
        type: String,
        required: [true, 'User needs a salt for password encryption.']
    },
    email: {
        type: String,
        required: [true, 'This user needs a email.']
    },
});
exports.default = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema, 'users');
