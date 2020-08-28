import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import mqttConnect from '../../lib/mqttConnect';
import notificationStream from '../../lib/AsyncGenrators/notificationsStream';

const client = mqttConnect(`👽📡🌡️ Server connected to the MQTT server at ${process.env.MQTT_URI}`);

const onMQTTSubscribe = (subId: number, granted: any[]) => {
    // console.log(`Subscription with id ${subId}`);
    // console.log(granted);
}

export const mqttPubSub = new MQTTPubSub({ client, onMQTTSubscribe });

const Subscription = {
    mqttTopics: {
        resolve: (payload: any) => {
            return { data: payload }
        },
        subscribe: (_: any, args: { topics: [string] }, context: any) => {
            return mqttPubSub.asyncIterator(args.topics);
        }
        // async (_: any, args: { topics: [string] }, context: any) => {
        //   const session = await context.session;
        //   if (session) {
        //     return mqttPubSub.asyncIterator(args.topics);
        //   } else {
        //     throw new AuthenticationError(`Sorry, but you have to be signed into subscribe to MQTT data.`);
        //   }
        // },
    },
    notificationChange: {
        resolve: (payload: any) => {
            if (payload.operationType === "insert") {
                var doc = payload.fullDocument;
                doc.id = doc._id;
                return { notification: payload.fullDocument, type: payload.operationType };
            } else {
                return { notification: { id: payload.documentKey._id }, type: payload.operationType };
            }
        },
        subscribe: () => {
            const it = notificationStream();
            return it;
        }
    }
}

export default Subscription;