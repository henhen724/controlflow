import gql from 'graphql-tag';
import { useState, useEffect } from 'react';
import { useSubscription, useMutation, useQuery } from '@apollo/react-hooks';
import { Button, CircularProgress, Container } from '@material-ui/core';


const GetDevices = gql`
query GetDevices {
  devices {
    uri
    deviceSchema
    name
    osName
    platform
  }
}
`
interface deviceSchema {
    in: {
        [key: string]: Object
    }
    out: {
        [key: string]: Object
    }
}

interface device {
    uri: string;
    deviceSchema: deviceSchema;
    name: string;
    osName: string;
    platform: string;
}

interface QRslt {
    devices: device[]
}

// const DataSubscription = gql`
// subscription getData($topicList: [String]!) {
//   mqttTopics(topics: $topicList) {
//       data
//   }
// }
// `

// interface SubRslt {
//     mqttTopics: { data: Object }
// }

const SendDeviceRefresh = gql`
mutation SendDeviceRefresh{
  mqttPublish(input:{topic:"__widaq_req_info__", payload:{}}) {
    success
  }
}
`

const devicenetwork = (props: any) => {
    const [network, setNetwork] = useState<device[] | null>(null);
    const [refreshDevices] = useMutation(SendDeviceRefresh);
    useQuery<QRslt>(GetDevices, {
        onCompleted: (data) => {
            setNetwork(data.devices)
        }
    })
    if (network) {
        const redneredDevices = network.map(device => {
            console.log(device);
            return (<div key={device.uri}> {device.uri} In Topics: {Object.keys(device.deviceSchema.in)} Out Topics: {Object.keys(device.deviceSchema.out)}<Button color="secondary" onClick={() => window.open(`${device.uri}/widaq/ssh`, "_blank")}>Remote Terminal</Button></div>)
        })
        return (<Container>
            {redneredDevices}
        </Container>)
    } else {
        return (<Container maxWidth="sm"><h1>Device Network Loading</h1><CircularProgress /></ Container>)
    }

}

export default devicenetwork;