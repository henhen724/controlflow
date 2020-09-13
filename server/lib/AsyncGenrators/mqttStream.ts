import { on } from 'events';
import mqttConnect from '../mqttConnect';

const getMqttStream = () => {
    const client = mqttConnect("👽", "Server");

    return on(client, "message");
}

export default getMqttStream;