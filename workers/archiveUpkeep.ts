import ArchiveDataPacket from '../server/models/ArchiveDataPacket';
import { MqttClient } from 'mqtt';
import BufferInfoModel, { BufferInfo } from '../server/models/TopicBufferInfo';

let topicBufferInfos = null as BufferInfo[] | null;

export const bufferListner = (msgTopic: string, message: Buffer) => {
    if (topicBufferInfos) {
        const bufferInfo = topicBufferInfos.find(({ topic }) => topic === msgTopic);
        if (bufferInfo) {
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
    const newTopicBufferInfos = await BufferInfoModel.find().exec();
    var oldTopics = [] as string[];
    if (topicBufferInfos)
        oldTopics = topicBufferInfos.map(({ topic }) => topic);
    const newTopics = newTopicBufferInfos.map(({ topic }) => topic);
    const addedTopics = newTopics.filter(topic => !oldTopics.includes(topic));
    const removedTopics = oldTopics.filter(topic => !newTopics.includes(topic));
    if (addedTopics.length !== 0) {
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