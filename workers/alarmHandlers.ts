import { MqttClient } from 'mqtt';
import Watchdog, { IWatchdog } from "../models/Watchdog";
import Notification, { INotification } from '../models/Notification';
import { attachBufferLister } from './runningBuffer';

let currWatchdogs = null as IWatchdog[] | null;
let topics = null as string[] | null;

export const attachAlarmListner = (client: MqttClient) => {
    client.on("message", (msgTopic, message) => {
        if (currWatchdogs && topics && topics.find(topic => topic === msgTopic)) {
            currWatchdogs.forEach(currWatch => {
                if (currWatch.topics.find(topic => topic === msgTopic)) {
                    new Notification({
                        name: currWatch.name,
                        topic: msgTopic,
                        message: currWatch.messageString,
                        mqttMessage: message.toString(),
                    });
                }
            });
        }
    });
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
    attachBufferLister(client);
    setInterval(() => updateTopicSubsriptions(client), 1000);
}