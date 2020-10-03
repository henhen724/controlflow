require('dotenv').config({ path: '.env.local' })
import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import rollingBuffer, { bufferListner } from './runningBuffer';
import handleAlarms, { alarmListner } from './alarmHandlers';
import deviceNetworkStart, { deviceNetworkListner } from './deviceNetwork';
import mqttConnect from '../server/lib/mqttConnect';
import { GraphQLClient } from 'graphql-request';


const runWorkers = async () => {
    await mongoose.connect(`${process.env.MONGODB_PROTO}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        },
        (err: MongoError) => {
            if (err) {
                console.error(`🤖🟥🗃️ Worker failed to connect to the database.`);
                console.error(err);
            } else {
                console.log(`🤖📡🗃️ Worker connected to the database at ${process.env.MONGODB_PROTO}${process.env.MONGODB_DOMAIN}`);
            }
        }
    );

    const mqttClient = mqttConnect(`🤖`, "Worker");

    const PORT = process.env.PORT || "3000";

    const gqlClient: GraphQLClient = new GraphQLClient(`http://localhost:${PORT}/graphql`, {
        credentials: "include",
        mode: "cors"
    });

    mqttClient.on("message", (msgTopic, message) => {
        bufferListner(msgTopic, message);
        alarmListner(gqlClient, msgTopic, message);
        deviceNetworkListner(gqlClient, msgTopic, message);
    });
    rollingBuffer(mqttClient);
    handleAlarms(mqttClient);
    deviceNetworkStart(mqttClient);
}

runWorkers();