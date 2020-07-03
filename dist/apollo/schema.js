"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const type_defs_1 = __importDefault(require("./type-defs"));
const resolvers_1 = require("./resolvers");
exports.default = graphql_tools_1.makeExecutableSchema({
    typeDefs: type_defs_1.default,
    resolvers: resolvers_1.resolvers,
});
