import DataPacket from '../models/DataPacket';
import dbConnect from '../lib/dbConnect';
import mqttConnect from '../lib/mqttConnect';
import TopicBufferInfos, { ITopic } from '../models/TopicBufferInfo';

const client = mqttConnect();

let topicBufferInfos = null as ITopic[] | null;

client.on("message", (msgTopic, message) => {
    if (topicBufferInfos) {
        const bufferInfo = topicBufferInfos.find(({ topic }) => topic === msgTopic);
        if (bufferInfo) {
            const msgObj = JSON.parse(message.toString()).catch((err: any) => {
                console.error(`Possible non JSON packet sent to topic ${msgTopic}:${message}`);
                console.error(err);
            });
            if (msgObj) {
                const newPacket = new DataPacket({
                    experationDate: Date.now() + bufferInfo.experationTime,
                    topic: msgTopic,
                    data: msgObj,
                });
            }
        }
    }
});

export const removeExpiredPackets = async () => {
    await dbConnect();

    const currTime = Date.now();
    DataPacket.deleteMany({ experationDate: { $lte: currTime } }, err => {
        if (err)
            console.error(err);
    })
}

export const updateTopicSubsriptions = async () => {
    await dbConnect();

    topicBufferInfos = await TopicBufferInfos.find().exec();
    const topics = topicBufferInfos.map(({ topic, experationTime }) => topic);
    if (topics.length !== 0) {
        client.subscribe(topics, err => {
            if (err)
                console.error(err);
        })
    }
}

export default () => {
    setInterval(removeExpiredPackets, 60 * 1000);
    setInterval(updateTopicSubsriptions, 60 * 1000);
}