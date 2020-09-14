import { Component, ChangeEvent } from 'react';
import { PanelProps, PanelSettings } from './index';
import MatSwitch from '@material-ui/core/Switch';

export type SwitchSettings = PanelSettings<{ format: (on: boolean) => Object }, "switch">;
export type SwitchProps = PanelProps<SwitchSettings>;

export class Switch extends Component<SwitchProps, { onState: boolean }> {
    constructor(props: SwitchProps) {
        super(props);
        this.state = {
            onState: false
        }
    }
    switchChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        this.props.mqttPublish({
            variables: {
                topic: this.props.settings.topic,
                payload: this.props.settings.displayProps.format(!this.state.onState)
            }
        })
        this.setState({
            onState: !this.state.onState
        })
    }
    render() {

        return (<MatSwitch onChange={this.switchChange} checked={this.state.onState} color="secondary" />)
    }
}