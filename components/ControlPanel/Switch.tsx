import { Component, ChangeEvent } from 'react';
import { ControlPanelProps } from './index';

export type SwitchProps = ControlPanelProps<{}, "switch">;

export class Switch extends Component<{ props: SwitchProps, data: any[], sendMqttPacket: (msg: any) => any }, { onState: boolean }> {
    constructor(props: { props: SwitchProps, data: any[], sendMqttPacket: (msg: any) => boolean }) {
        super(props);
        this.state = {
            onState: false
        }
    }
    switchChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        this.props.props.formatAndSend(!this.state.onState, this.props.sendMqttPacket);
        this.setState({
            onState: !this.state.onState
        })
    }
    render() {
        return (<div className="mat-switch-wraper">
            <input className="mat-switch" id="checkbox" type="checkbox" onChange={this.switchChange} checked={this.state.onState} />
            <label className="mat-switch-label" htmlFor="checkbox" />
        </div>)
    }
}