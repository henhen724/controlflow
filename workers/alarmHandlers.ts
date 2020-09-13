import { MqttClient } from 'mqtt';
import Watchdog, { IWatchdog } from "../server/models/Watchdog";
import Notification, { INotification } from '../server/models/Notification';

let currWatchdogs = null as IWatchdog[] | null;
let topics = null as string[] | null;

export const alarmListner = (msgTopic: string, message: Buffer) => {
    if (currWatchdogs && topics && topics.find(topic => topic === msgTopic)) {
        console.log(`Topic alarm found for ${msgTopic}`);
        currWatchdogs.forEach(currWatch => {
            if (currWatch.topics.find(topic => topic === msgTopic)) {
                const newNotif = new Notification({
                    name: currWatch.name,
                    topic: msgTopic,
                    message: currWatch.messageString,
                    mqttMessage: message.toString(),
                });
                newNotif.save();
            }
        });
    }
}

export const updateTopicSubsriptions = async (client: MqttClient) => {
    currWatchdogs = await Watchdog.find().exec();
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