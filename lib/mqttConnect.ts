import { connect, MqttClient } from 'mqtt';

interface MqttConnection {
    client: undefined | MqttClient
}

const connection = {} as MqttConnection;

const mqttConnect = () => {
    if (connection.client) return connection.client;

    if (!process.env.MQTT_URI) throw new Error(`No MQTT URI loaded.`);
    if (!process.env.MQTT_USERNAME) throw new Error(`No MQTT username loaded.`);
    if (!process.env.MQTT_PASSWORD) throw new Error(`No MQTT password loaded.`);
    connection.client = connect(`${process.env.MQTT_URI}`, { username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD, reconnectPeriod: 1000 });
    connection.client.on('connect', () => {
        console.log(`🌡️ Connected to the MQTT server at ${process.env.MQTT_URI}`);
    })
    return connection.client;
}

export default mqttConnect;