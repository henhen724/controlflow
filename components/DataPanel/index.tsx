import { Component } from 'react';
import { LineGraph, LineGraphProps } from './LineGraph';

export interface DataPanelProps<TDisplayProps, StrDisplayType> {
    topic: string,
    displayProps: TDisplayProps,
    displayType: StrDisplayType,
    elemType: "data",
}

export type UnionDataPanelProps = LineGraphProps;

interface DataByTopic {
    [key: string]: Object[]
}

export class DataComponent extends Component<{ props: UnionDataPanelProps, data: DataByTopic }, {}> {
    constructor(props: { props: UnionDataPanelProps, data: DataByTopic }) {
        super(props);
    }
    render() {
        switch (this.props.props.displayType) {
            case "line-graph":
                return (<LineGraph props={this.props.props} data={this.props.data[this.props.props.topic]} />);
        }
    }
}