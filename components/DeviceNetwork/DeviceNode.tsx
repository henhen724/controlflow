import { Button, CircularProgress, Container } from '@material-ui/core';

interface deviceSchema {
    in: {
        [key: string]: Object
    }
    out: {
        [key: string]: Object
    }
}

export interface device {
    uri: string;
    deviceSchema: deviceSchema;
    name: string;
    osName: string;
    platform: string;
}

interface nodeProps {
    device: device;
}

const devicenode = (props: nodeProps) => {
    const { device } = props;
    return (
        <div key={device.uri}>
            {device.name}
            Operating System: {device.osName}
            In Topics: {Object.keys(device.deviceSchema.in)}
            Out Topics: {Object.keys(device.deviceSchema.out)}
            <Button color="secondary" onClick={() => window.open(`${device.uri}/widaq/ssh`, "_blank")}>Remote Terminal</Button>
        </div>);
}

export default devicenode;