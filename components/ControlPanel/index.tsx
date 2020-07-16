import { Component } from 'react';
import { Switch, SwitchProps } from './Switch';

export interface ControlPanelProps<TDisplayProps, StrDisplayType> {
    topic: string,
    formatAndSend: (obj: any, SendMqttPacket: (msg: any) => boolean) => Object,
    displayProps: TDisplayProps,
    displayType: StrDisplayType,
    elemType: "control",
}

export type UnionControlPanelProps = SwitchProps;

interface DataByTopic {
    [key: string]: Object[]
}

export class ControlComponent extends Component<{ props: UnionControlPanelProps, sendMqttPacket: (msg: any) => any, data: DataByTopic }, {}> {
    constructor(props: { props: UnionControlPanelProps, sendMqttPacket: (msg: any) => any, data: DataByTopic }) {
        super(props)
    }
    render() {
        switch (this.props.props.displayType) {
            case "switch":
                return (<Switch props={this.props.props} data={this.props.data[this.props.props.topic]} sendMqttPacket={this.props.sendMqttPacket} />);
        }
    }
}