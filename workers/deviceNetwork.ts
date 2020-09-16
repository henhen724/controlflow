import { MqttClient } from 'mqtt';
import Device from '../server/models/Device';

export const topicNetworkListner = async (msgTopic: string, messageStr: Buffer) => {
    // console.log(`${msgTopic}:${messageStr.toString()}`);
    let message = null;
    try {
        message = JSON.parse(messageStr.toString());
    } catch (err) {
        console.error(`Wi DAQ internal topic posted a non-json string.  Here is the message:\n${messageStr}`);
        console.error(err);
    }
    switch (msgTopic) {
        case "__widaq_info__":
            message.connected = true;
            Device.updateOne({ ip: message.ip }, message, { upsert: true, runValidators: true }, (err: any) => {
                if (err) console.error(err);
            });
            break;
        case "__widaq_disconnect__":
            message.connected = false;
            Device.deleteOne({ ip: message.ip });
            break;
    }
}

export default (client: MqttClient) => {
    client.subscribe(["__widaq_info__"], err => {
        if (err)
            console.error(err);
    });
    client.publish("__widaq_req_info__", "{}");
}