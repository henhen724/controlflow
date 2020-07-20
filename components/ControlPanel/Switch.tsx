import { Component, ChangeEvent } from 'react';
import { ControlPanelProps, FullControlPanelProps } from './index';
import MatSwitch from '@material-ui/core/Switch';

export type SwitchProps = ControlPanelProps<{}, "switch">;
export type FullSwitchProps = FullControlPanelProps<SwitchProps>;

export class Switch extends Component<FullSwitchProps, { onState: boolean }> {
    constructor(props: FullSwitchProps) {
        super(props);
        this.state = {
            onState: false
        }
    }
    switchChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        this.props.sendMqttPacket({ variables: { payload: this.props.props.format(!this.state.onState), topic: this.props.props.topic } });
        this.setState({
            onState: !this.state.onState
        })
    }
    render() {

        return (<MatSwitch onChange={this.switchChange} checked={this.state.onState} color="secondary" />)
    }
}