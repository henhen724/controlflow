import { MqttClient } from 'mqtt';
import WatchdogModel, { Watchdog } from "../server/models/Watchdog";
import { GraphQLClient, request, gql } from 'graphql-request';

let currWatchdogs = null as Watchdog[] | null;
let topics = null as string[] | null;

export const alarmListner = (client: GraphQLClient, msgTopic: string, message: Buffer) => {
    if (currWatchdogs && topics && topics.find(topic => topic === msgTopic)) {
        console.log(`Topic alarm found for ${msgTopic}`);
        currWatchdogs.forEach(currWatch => {
            if (currWatch.topics.find(topic => topic === msgTopic)) {
                client.request(
                    gql`mutation CreateNotification($name: String!,$topic: String!,$message: String!,$mqttMessage: String!) {
                        createNotification(name:$name, topic:$topic, message:$message, mqttMessage:$mqttMessage) {
                            name
                        }
                    }`,
                    {
                        name: currWatch.name,
                        topic: msgTopic,
                        message: currWatch.messageString,
                        mqttMessage: message.toString(),
                    }
                );
            }
        });
    }
}

export const updateTopicSubsriptions = async (client: MqttClient) => {
    currWatchdogs = await WatchdogModel.find().exec();
    topics = currWatchdogs.reduce((topicsSoFar, { topics }) => topicsSoFar.concat(topics), [] as string[]);
    if (topics.length !== 0) {
        client.subscribe(topics, err => {
            if (err)
                console.error(err);
        })
    }
}

export default (client: MqttClient) => {
    setInterval(() => updateTopicSubsriptions(client), 1000);
}