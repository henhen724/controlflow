import React, { Component } from "react";
import { LineChart, Line, CartesianAxis, XAxis, YAxis, CartesianGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, } from "recharts";

export interface LineGraphProps {
    width?: number,
    hieght?: number,
    FirstAxis?: CartesianAxis | PolarAngleAxis | PolarRadiusAxis | XAxis | YAxis,
    SecondAxis?: CartesianAxis | PolarAngleAxis | PolarRadiusAxis | XAxis | YAxis,
    color?: string,
    data: { [key: string]: string }[],
    firstDataKey?: string,
    secondDataKey?: string,
}

const defaultPlot = {
    firstDataKey: "time",
    secondDataKey: "temp",
    color: "#ab83d6"
}

class Graph extends Component<LineGraphProps, LineGraphProps> {
    constructor(props: LineGraphProps) {
        super(props);
        this.state = {
            ...defaultPlot,
            ...this.props,
        };
    }

    render() {
        var { FirstAxis, SecondAxis, color, data, firstDataKey, secondDataKey, width, hieght } = this.state;
        return (<LineChart width={width} height={hieght} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey={firstDataKey!} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={secondDataKey!} stroke={color} activeDot={{ r: 8 }} />
        </LineChart>)
    }
}

export default Graph;