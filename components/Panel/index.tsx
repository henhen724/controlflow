import { Component } from 'react';
import { Switch, SwitchSettings, SwitchProps } from './Switch';
import { LineGraph, LineGraphProps, LineGraphSettings } from './LineGraph';
import { MutationFunctionOptions } from '@apollo/react-common/lib/types/types';

interface SendMqttPacketInput {
    topic: string,
    payload: Object
}

interface SuccessBoolean {
    success: boolean
}
interface DataByTopic {
    [key: string]: Object[]
}

export interface PanelSettings<TDisplayProps, StrDisplayType> {
    topic: string,
    displayProps: TDisplayProps,
    displayType: StrDisplayType,
}

export type UnionPanelSettings = SwitchSettings | LineGraphSettings;

export interface PanelProps<TPanelProps> {
    settings: TPanelProps,
    data: DataByTopic,
    mqttPublish: (options?: MutationFunctionOptions<SuccessBoolean, SendMqttPacketInput>) => Promise<any>
}

export type UnionPanelProps = SwitchProps | LineGraphProps;


export const getPanelFromProps = (props: UnionPanelProps) => {
    switch (props.settings.displayType) {
        case "switch":
            return (<Switch {...props as SwitchProps} />);
        case "line-graph":
            return (<LineGraph {...props as LineGraphProps} />);
    }
}