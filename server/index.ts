import express from 'express';
import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import { createServer } from 'http';
import { parse } from 'url';
import { join } from 'path';
import fs from 'fs';
import next from 'next';
import { ApolloServer } from 'apollo-server-express';
const nextApp = next({ dev: process.env.NODE_ENV !== 'production', conf: { publicDirectory: true } }); //This loads all of the enviroment varibles


import schema from '../apollo/schema';
import { getLoginSession } from '../lib/auth';

//TODO: Add a MQTT state request bundle. (Ask every mqtt client with an on change type packet to post its current state.)
//TODO: Update name to Wi- DAQ

import rollingBuffer from '../workers/runningBuffer';
import handleAlarms from '../workers/alarmHandlers';
rollingBuffer();
handleAlarms();

const PORT = process.env.PORT || "3000";
const publicFolderPath = join(__dirname, '../public');
let staticFiles = [] as string[];
fs.readdir(publicFolderPath, (err, files) => {
    if (err) {
        console.error(err)
    } else {
        console.log(files);
        staticFiles = files;
    }
});


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
    expressApp.all('*', (req, res) => {
        const { pathname, query } = parse(req.url, true);
        if (!pathname) throw new Error(`Failed to parse url ${req.url}.`); //Apparently, url.parse can failed 🤔
        if (staticFiles.indexOf(pathname.split("/")[1]) > -1) {
            const filePath = join(publicFolderPath, pathname);
            console.log(`Serving ${filePath}`);
            // console.log(fs.readFileSync(filePath).toString());
            nextApp.serveStatic(req, res, filePath);
        } else {
            console.log(`Looking for the ${pathname} component path.`);
            nextApp.render(req, res, pathname, query);
        }
    })

    const httpServer = createServer(expressApp);
    apollo.installSubscriptionHandlers(httpServer);

    httpServer.listen({ port: PORT }, () => {
        console.log(`👨‍🚀 Wi-DAQ website ready at http://localhost:${PORT}`);
        console.log(`🛸 GraphQL API ready at http://localhost:${PORT}${apollo.graphqlPath}`);
        console.log(`👽 Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`);
    })
}

startServer();