import React, { Component } from "react";
import { LineChart, Line, CartesianAxis, XAxis, YAxis, CartesianGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import moment from 'moment';

export interface LineGraphProps {
    width?: number,
    hieght?: number,
    FirstAxis?: CartesianAxis | PolarAngleAxis | PolarRadiusAxis | XAxis | YAxis,
    SecondAxis?: CartesianAxis | PolarAngleAxis | PolarRadiusAxis | XAxis | YAxis,
    color?: string,
    data: Object[],
    firstDataKey: string,
    secondDataKey: string,
}

const defaultPlot = {
    color: "#ab83d6",
    width: 700,
    hieght: 500,
}

class Graph extends Component<LineGraphProps, {}> {
    constructor(props: LineGraphProps) {
        super(props);
    }

    render() {
        const propsToRender = { ...defaultPlot, ...this.props }
        var { FirstAxis, SecondAxis, color, data, firstDataKey, secondDataKey, width, hieght } = propsToRender;
        return (<ResponsiveContainer width="95%" height={hieght}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey={firstDataKey} tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={secondDataKey} stroke={color} activeDot={{ r: 0 }} />
            </LineChart>
        </ResponsiveContainer>)
    }
}

export default Graph;