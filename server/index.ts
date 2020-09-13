import express from 'express';
import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import { createServer } from 'http';
import next from 'next';
import { ApolloServer } from 'apollo-server-express';
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' }); //This loads all of the enviroment varibles
const nextHandler = nextApp.getRequestHandler();

import schema from './apollo/schema';
import { getLoginSession } from './lib/auth';

//TODO: Add a MQTT state request bundle. (Ask every mqtt client with an on change type packet to post its current state.)
//TODO: Update name to Wi- DAQ

const PORT = process.env.PORT || "3000";


const startServer = async () => {
    await nextApp.prepare();
    await mongoose.connect(`${process.env.MONGODB_PROTO}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        (err: MongoError) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`🗃️ Connected to the database at ${process.env.MONGODB_PROTO}${process.env.MONGODB_DOMAIN}`);
            }
        }
    );

    const expressApp = express();
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
    expressApp.use(express.static('public'));
    expressApp.all('*', (req, res) => nextHandler(req, res));

    const httpServer = createServer(expressApp);
    apollo.installSubscriptionHandlers(httpServer);

    httpServer.listen({ port: PORT }, () => {
        console.log(`👨‍🚀 Wi-DAQ website ready at http://localhost:${PORT}`);
        console.log(`🛸 GraphQL API ready at http://localhost:${PORT}${apollo.graphqlPath}`);
        console.log(`👽 Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`);
    })
}

startServer();