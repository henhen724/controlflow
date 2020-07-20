import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { ApolloServer } from 'apollo-server-express';
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' }); //This loads all of the enviroment varibles


import schema from '../apollo/schema';
import { getLoginSession } from '../lib/auth';
import dbConnect from '../lib/dbConnect';

import rollingBuffer from '../workers/runningBuffer';
rollingBuffer();

const PORT = process.env.PORT || "3000";

nextApp.prepare().then(() => {
    const expressApp = express();
    dbConnect();
    const apollo = new ApolloServer({
        schema,
        context: (ctx) => {
            return {
                session: getLoginSession(ctx.req),
                req: ctx.req,
                res: ctx.res,
            }
        },
    });
    apollo.applyMiddleware({ app: expressApp, path: '/graphql' });
    expressApp.all('*', (req, res) => {
        const { pathname, query } = parse(req.url, true);
        if (!pathname) throw new Error(`Failed to parse url ${req.url}.`); //Apparently, url.parse can failed 🤔
        nextApp.render(req, res, pathname, query);
    })

    const httpServer = createServer(expressApp);
    apollo.installSubscriptionHandlers(httpServer);

    httpServer.listen({ port: PORT }, () => {
        console.log(`👨‍🚀 Controlflow website ready at http://localhost:${PORT}`);
        console.log(`🛸 GraphQL API ready at http://localhost:${PORT}${apollo.graphqlPath}`);
        console.log(`👽 Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`);
    })
})