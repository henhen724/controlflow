import { MqttClient } from 'mqtt';
import { GraphQLClient, request, gql } from 'graphql-request';

const PORT = process.env.PORT || "3000";

export const deviceNetworkListner = async (client: GraphQLClient, msgTopic: string, messageStr: Buffer) => {
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
            client.request(
                gql`
                mutation ConnectDevice($ip: IPv4!,$port: Float!,$secure: Boolean!,$name: String!,$platform: String!,$osName: String!,$deviceSchema: JSON!) {
                    connect(ip:$ip, port:$port, secure:$secure, name:$name, platform:$platform, osName:$osName, deviceSchema:$deviceSchema) {
	                    success
                    }
                }`,
                message)
            break;
        case "__widaq_disconnect__":
            client.request(
                gql`
                mutation DisconnectDevice($ip: IPv4!) {
                    disconnectByIp(ip:$ip) {
	                    success
                    }
                }`,
                message);
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