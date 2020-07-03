"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const apollo_server_express_1 = require("apollo-server-express");
const nextApp = next_1.default({ dev: process.env.NODE_ENV !== 'production' });
const handle = nextApp.getRequestHandler();
const schema_1 = __importDefault(require("../apollo/schema"));
const auth_1 = require("../lib/auth");
const dbConnect_1 = __importDefault(require("../lib/dbConnect"));
const PORT = process.env.PORT || 3000;
nextApp.prepare().then(() => {
    const expressApp = express_1.default();
    dbConnect_1.default();
    const apollo = new apollo_server_express_1.ApolloServer({
        schema: schema_1.default,
        context: (ctx) => {
            return {
                session: auth_1.getLoginSession(ctx.req),
                req: ctx.req,
                res: ctx.res,
            };
        },
    });
    apollo.applyMiddleware({ app: expressApp, path: '/api/graphql' });
    expressApp.all('*', (req, res) => {
        const { pathname, query } = url_1.parse(req.url, true);
        if (!pathname)
            throw new Error(`Failed to parse url ${req.url}.`); //Apparently, url.parse can failed 🤔
        nextApp.render(req, res, pathname, query);
    });
    const httpServer = http_1.createServer(expressApp);
    apollo.installSubscriptionHandlers(httpServer);
    httpServer.listen({ port: PORT }, () => {
        console.log(`👨‍🚀 Controlflow website ready at http://localhost:${PORT}`);
        console.log(`🛸 GraphQL API ready at http://localhost:${PORT}${apollo.graphqlPath}`);
        console.log(`👽 Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`);
    });
});
