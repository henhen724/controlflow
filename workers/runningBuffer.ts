import DataPacket, { IData } from '../models/DataPacket';
import { MqttClient } from 'mqtt';
import findBufferSize from '../lib/findBufferSize';
import TopicBufferInfos, { ITopic } from '../models/TopicBufferInfo';

let topicBufferInfos = null as ITopic[] | null;

export const bufferListner = (msgTopic: string, message: Buffer) => {
    if (topicBufferInfos) {
        const bufferInfo = topicBufferInfos.find(({ topic }) => topic === msgTopic);
        if (bufferInfo) {
            try {
                const msgObj = JSON.parse(message.toString())
                if (msgObj) {
                    // TODO: Frequency record control
                    // TODO: Add an only on change record
                    const currTime = new Date();
                    let newPacketObj = {
                        created: currTime,
                        expires: bufferInfo.expires,
                        experationDate: undefined as Date | undefined,
                        topic: msgTopic,
                        data: msgObj,
                    };
                    if (bufferInfo.expires && bufferInfo.experationTime) {
                        newPacketObj.experationDate = new Date(currTime.getDate() + bufferInfo.experationTime);
                    }
                    const newPacket = new DataPacket(newPacketObj);
                    newPacket.save();
                }
            } catch (err) {
                console.error(`ERROR:\n${message.toString()}\nThis was not proper JSON.  See following error stack:`, err);
            }
        }
    }
}

export const removeExpiredPackets = async () => {
    if (topicBufferInfos) {
        for (var i = 0; i < topicBufferInfos.length; i++) {
            const bufferInfo = topicBufferInfos[i];
            if (bufferInfo.expires && bufferInfo.experationTime) {
                const creationTimeOfExpPacket = new Date(Date.now() - bufferInfo.experationTime);
                DataPacket.deleteMany({ topic: bufferInfo.topic, created: { $lte: creationTimeOfExpPacket } }, err => {
                    if (err)
                        console.error(err);
                })
            }
        }
    }
}

export const removePacketsOverMemLimit = async () => {
    if (topicBufferInfos) {
        for (var i = 0; i < topicBufferInfos.length; i++) {
            const bufferInfo = topicBufferInfos[i];
            if (bufferInfo.sizeLimited && bufferInfo.maxSize) {
                const { total_size, packetSize } = await findBufferSize(bufferInfo.topic);
                // console.log(`Topic ${bufferInfo.topic} takes up ${total_size}/${bufferInfo.maxSize} bytes`);
                if (total_size > bufferInfo.maxSize) {
                    const numToDelete = Math.ceil((total_size - bufferInfo.maxSize) / packetSize);
                    // console.log(`Deleteing ${numToDelete} packets for ${total_size}`);
                    const idsForDeletion = await DataPacket.find({ topic: bufferInfo.topic }).sort({ 'created': 1 }).limit(numToDelete).select("_id").exec();
                    DataPacket.deleteMany({ _id: { $in: idsForDeletion } }).exec();
                }
            }
        }
    }
}

export const updateTopicSubsriptions = async (client: MqttClient) => {
    topicBufferInfos = await TopicBufferInfos.find().exec();
    const topics = topicBufferInfos.map(({ topic, experationTime }) => topic);
    if (topics.length !== 0) {
        client.subscribe(topics, err => {
            if (err)
                console.error(err);
        })
    }
}

export default (client: MqttClient) => {
    setInterval(removeExpiredPackets, 1000);
    setInterval(removePacketsOverMemLimit, 1000);
    setInterval(() => updateTopicSubsriptions(client), 1000);
}