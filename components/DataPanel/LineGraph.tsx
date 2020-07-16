import { DataComponent, DataPanelProps } from './index';
import { LineChart, Line, CartesianAxis, XAxis, YAxis, CartesianGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import moment from 'moment';
import { Component } from 'react';

export interface LineGraphDisplayProps {
    width?: number,
    hieght?: number,
    FirstAxis?: XAxis | YAxis,
    SecondAxis?: XAxis | YAxis,
    color?: string,
    firstDataKey: string,
    secondDataKey: string,
}

export type LineGraphProps = DataPanelProps<LineGraphDisplayProps, "line-graph">;

const defaultPlot = {
    color: "#ab83d6",
    width: 95,
    hieght: 500,
}


export class LineGraph extends Component<{ props: LineGraphProps, data: any[] }, {}>{
    constructor(props: { props: LineGraphProps, data: any[] }) {
        super(props);

    }

    render() {
        const propsToRender = { ...defaultPlot, ...this.props.props.displayProps };
        const { color, firstDataKey, secondDataKey, width, hieght } = propsToRender;
        const data = this.props.data;
        if (data) {
            return (<ResponsiveContainer width={width!.toString() + "%"} height={hieght}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" dataKey={firstDataKey} tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')} domain={["dataMax-300000", "dataMax"]} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => moment(value).format('HH:mm:ss')} />
                    <Legend />
                    <Line type="monotone" dataKey={secondDataKey} stroke={color} activeDot={{ r: 0 }} />
                </LineChart>
            </ResponsiveContainer>)
        } else {
            return (<div>Loading Chart...</div>)
        }
    }
}