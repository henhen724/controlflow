import React, { Component } from "react";
import ReactECharts from 'echarts-for-react';

class EGraph extends Component {
    eventSource: EventSource;
    constructor(props) {
        super(props);

        this.eventSource = new EventSource("events");
    }

    getEGraphOption() {
        return {
            title: {
                text: 'Live Photodetector Measurements.',
            },
            xAxis: {
                type: 'value',
            },
            yAxis: {
                type: 'value',
            },
            series: [{
                name: 'Photodetector',
                data: [],
                type: 'line'
            }]
        }
    }

    render() {
        return (<ReactECharts option={this.getEGraphOption()} />)
    }
}

export default EGraph;