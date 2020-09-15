import { PanelProps, PanelSettings } from './index';
import { LineChart, Line, CartesianAxis, XAxis, YAxis, CartesianGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import moment from 'moment-timezone';
import { Component } from 'react';
import { CircularProgress, Container } from '@material-ui/core';
import { useTheme } from '@material-ui/core';

export interface LineGraphDisplayProps {
    width?: number,
    height?: number,
    FirstAxis?: XAxis | YAxis,
    SecondAxis?: XAxis | YAxis,
    color?: string,
    firstDataKey: string,
    secondDataKey: string,
}

export type LineGraphSettings = PanelSettings<LineGraphDisplayProps, "line-graph">;
export type LineGraphProps = PanelProps<LineGraphSettings>;

const defaultPlot = {
    width: 95,
    height: 500,
}

export const LineGraph = (props: LineGraphProps) => {
    const theme = useTheme();
    const propsToRender = { ...defaultPlot, ...props.settings.displayProps };
    const { color, firstDataKey, secondDataKey, width, height } = propsToRender;
    const data = props.data[props.settings.topic];
    if (data) {
        return (<ResponsiveContainer width={width!.toString() + "%"} height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" dataKey={firstDataKey} tickFormatter={(unixTime) => moment.tz(unixTime, moment.tz.guess()).format('h:mm:ss a')} domain={["dataMin", "dataMax"]} />
                <YAxis />
                <Tooltip contentStyle={{ background: theme.palette.background.default }} labelFormatter={(value) => moment.tz(value, moment.tz.guess()).format('h:mm:ss a z')} />
                <Legend />
                <Line type="monotone" dataKey={secondDataKey} activeDot={{ r: 0 }} />
            </LineChart>
        </ResponsiveContainer>)
    } else {
        return (<Container maxWidth="sm"><h1>Loading Chart</h1><CircularProgress /></Container>)
    }
}