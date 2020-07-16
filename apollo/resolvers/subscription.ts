import { connect } from 'mqtt';
import { MQTTPubSub } from 'graphql-mqtt-subscriptions';

console.log(`${process.env.MQTT_URI}:${process.env.MQTT_PORT}`)
const client = connect(`${process.env.MQTT_URI}:${process.env.MQTT_PORT}`, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD, reconnectPeriod: 1000 });
client.on('connect', () => {
    console.log('Successfully connected to the MQTT server.')
})
const onMQTTSubscribe = (subId: number, granted: any[]) => {
    console.log(`Subscription with id ${subId}`);
    console.log(granted);
}
const publishOptions = (trigger: string, payload: any) => {

}
export const mqttPubSub = new MQTTPubSub({ client, onMQTTSubscribe });

const Subscription = {
    mqttTopics: {
        resolve: (payload: any) => {
            console.log(payload);
            return { data: payload, }
        },
        subscribe: (_: any, args: { topics: [string] }, context: any) => {
            console.log(`Subscribing to Topic:`, args.topics);
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