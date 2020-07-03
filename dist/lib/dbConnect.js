"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connection = { isConnected: false };
const dbConnect = async () => {
    if (connection.isConnected)
        return;
    if (!process.env.MONGODB_URI)
        throw new Error(`No Mongo URI loaded.`);
    console.log("Connecting to mongoDB.");
    const db = await mongoose_1.default.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    connection.isConnected = !!db.connections[0].readyState;
};
exports.default = dbConnect;
