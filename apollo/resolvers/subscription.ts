import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import mqttConnect from '../../lib/mqttConnect';
import getNotificationStream from '../../lib/AsyncGenrators/notificationsStream';

const client = mqttConnect("👽", "Server");


export const mqttPubSub = new MQTTPubSub({ client });

const Subscription = {
    mqttTopics: {
        resolve: (payload: any) => {
            return { data: payload }
        },
        subscribe: (_: any, args: { topics: [string] }, context: any) => {
            return mqttPubSub.asyncIterator(args.topics);
        }
    },
    notificationChange: {
        resolve: (payload: any) => payload[0],
        subscribe: getNotificationStream
    }
}

export default Subscription;