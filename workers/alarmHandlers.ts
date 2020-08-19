import dbConnect from "../lib/dbConnect";
import mqttConnect from '../lib/mqttConnect';
import Watchdog, { IWatchdog } from "../models/Watchdog";
import Notification, { INotification } from '../models/Notification';

const client = mqttConnect();

let currWatchdogs = null as IWatchdog[] | null;
let topics = null as string[] | null;

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

export const updateTopicSubsriptions = async () => {
    await dbConnect();

    currWatchdogs = await Watchdog.find().exec();
    topics = currWatchdogs.reduce((topicsSoFar, { topics }) => topicsSoFar.concat(topics), [] as string[]);
    if (topics.length !== 0) {
        client.subscribe(topics, err => {
            if (err)
                console.error(err);
        })
    }
}

export default updateTopicSubsriptions;