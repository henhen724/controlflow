import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import mqttConnect from '../../lib/mqttConnect';

const client = mqttConnect();
const onMQTTSubscribe = (subId: number, granted: any[]) => {
    // console.log(`Subscription with id ${subId}`);
    // console.log(granted);
}
const publishOptions = (trigger: string, payload: any) => {

}
export const mqttPubSub = new MQTTPubSub({ client, onMQTTSubscribe });

const Subscription = {
    mqttTopics: {
        resolve: (payload: any) => {
            return { data: payload, }
        },
        subscribe: (_: any, args: { topics: [string] }, context: any) => {
            // console.log(`Subscribing to Topic: ${args.topics}`);
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
}

export default Subscription;