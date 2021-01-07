import ArchiveDataPacket from '../server/models/ArchiveDataPacket';
import { MqttClient } from 'mqtt';
import TopicArchiveModel, { TopicArchive } from '../server/models/TopicArchive';

let topicArchiveInfos = null as TopicArchive[] | null;

export const archiveListner = (msgTopic: string, message: Buffer) => {
    if (topicArchiveInfos) {
        const bufferInfo = topicArchiveInfos.find(({ topic }) => topic === msgTopic);
        if (bufferInfo && bufferInfo.recording) {
            try {
                const msgObj = JSON.parse(message.toString())
                if (msgObj) {
                    const currTime = new Date();
                    let newPacketObj = {
                        created: currTime,
                        topic: msgTopic,
                        data: msgObj,
                    };
                    const newPacket = new ArchiveDataPacket(newPacketObj);
                    newPacket.save();
                }
            } catch (err) {
                console.error(`ERROR:\n${message.toString()}\nThis was not proper JSON.  See following error stack:`, err);
            }
        }
    }
}

export const updateTopicSubsriptions = async (client: MqttClient) => {
    const newTopicArchive = (await TopicArchiveModel.find()) as TopicArchive[];
    var oldTopics = [] as string[];
    if (topicArchiveInfos)
        oldTopics = topicArchiveInfos.map(({ topic }) => topic);
    topicArchiveInfos = newTopicArchive;
    const newTopics = newTopicArchive.map(({ topic }) => topic);
    const addedTopics = newTopics.filter(topic => !oldTopics.includes(topic));
    const removedTopics = oldTopics.filter(topic => !newTopics.includes(topic));
    if (addedTopics.length !== 0) {
        console.log(addedTopics)
        client.subscribe(addedTopics, err => {
            if (err)
                console.error(err);
        })
    }
    if (removedTopics.length !== 0) {
        client.unsubscribe(removedTopics, err => {
            if (err)
                console.error(err);
        })
    }
}

export default (client: MqttClient) => {
    setInterval(() => updateTopicSubsriptions(client), 1000);
}