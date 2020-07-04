import { connect } from 'mqtt';
import { ISubscriptionGrant } from 'mqtt/types/lib/client';
import { MQTTPubSub } from 'graphql-mqtt-subscriptions';

const client = connect('mqtt://broker.shiftr.io:1883', { username: process.env.SHIFTER_USERNAME, password: process.env.SHIFTER_PASSWORD, reconnectPeriod: 1000 });
const onMQTTSubscribe = (subId: number, granted: ISubscriptionGrant[]) => {
    console.log(`Subscription with id ${subId}`);
    console.log(granted);
}
const mqttPubSub = new MQTTPubSub({ client, onMQTTSubscribe });

const Subscription = {
    mqttTopics: {
        resolve: (payload: any) => {
            var brightness = payload;
            const packet = {
                topic: "SENSOR",
                data: {
                    brightness,
                    time: Date.now()
                },
            };
            console.log(packet);
            return packet;
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
}

export default Subscription;