import { Component } from 'react';
import { Switch, SwitchProps } from './Switch';
import { MutationFunctionOptions } from '@apollo/react-common/lib/types/types';

interface SendMqttPacketInput {
    topic: string,
    payload: Object
}

interface SuccessBoolean {
    success: boolean
}

export interface ControlPanelProps<TDisplayProps, StrDisplayType> {
    topic: string,
    format: (obj: any) => Object,
    displayProps: TDisplayProps,
    displayType: StrDisplayType,
    elemType: "control",
}

export type UnionControlPanelProps = SwitchProps;

export interface FullControlPanelProps<TControlPanelProps> {
    props: TControlPanelProps,
    data: DataByTopic,
    sendMqttPacket: (options?: MutationFunctionOptions<SuccessBoolean, SendMqttPacketInput>) => Promise<any>
}

interface DataByTopic {
    [key: string]: Object[]
}

export class ControlComponent extends Component<FullControlPanelProps<UnionControlPanelProps>, {}> {
    constructor(props: FullControlPanelProps<UnionControlPanelProps>) {
        super(props)
    }
    render() {
        switch (this.props.props.displayType) {
            case "switch":
                return (<Switch props={this.props.props} data={this.props.data} sendMqttPacket={this.props.sendMqttPacket} />);
        }
    }
}