import { MqttClient } from 'mqtt';
import DeviceInfo from '../server/models/Device';

export const topicNetworkListner = (msgTopic: string, messageStr: string) => {
    let message = null;
    try {
        message = JSON.parse(messageStr);
    } catch (err) {
        console.error(`Wi DAQ internal topic posted a non-json string.  Here is the message:\n${messageStr}`);
        console.error(err);
    }
    switch (msgTopic) {
        case "__widaq_info__":
            DeviceInfo.create(message, (err: any) => {
                if (err) console.error(err);
            });
            break;
    }
}

export default (client: MqttClient) => {
    client.subscribe(["__widaq_state__"], err => {
        if (err)
            console.error(err);
    });
    client.publish("__widaq_req_info__", "{}");
}