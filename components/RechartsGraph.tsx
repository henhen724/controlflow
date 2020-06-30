import React, { Component } from "react";
import { LineChart, Line, XAxis, YAxis, CartisianGrid, Tooltip, Legend, } from "recharts";

interface GraphProps {
    xProperty: string,
    yProperty: string,
    data: any[],
}

class Graph extends Component<GraphProps, {}> {
    constructor(props: GraphProps) {
        super(props);
    }

    render() {
        return (<LineChart width={500} height={300} data={this.props.data} margin={{ top: 5, right: 30, left: 20, bottum: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>)
    }
}

export default Graph;