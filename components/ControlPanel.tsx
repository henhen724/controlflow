import LineGraph, { LineGraphProps } from "./LineGraph";
import gql from 'graphql-tag';
import { useState } from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { getErrorMessage } from '../lib/form';

interface DataElementProps {
    graphProps: LineGraphProps,
    topic: string,
}

// interface ControlElementProps {
//     controlProps: [],
//     topics: string[],
// }

const DataSubscription = gql`
subscription getData($topicList: [String]!) {
  mqttTopics(topics: $topicList){
    topic
    data
  }
}
`

interface ControlPanelProps {
    dataElements: DataElementProps[],
}

interface DataByTopic {
    [key: string]: Object[]
}

interface DataPacket {
    topic: string,
    data: Object
}
interface SubRslt {
    mqttTopics: DataPacket
}

const controlPanel = (props: ControlPanelProps) => {
    const allTopics = props.dataElements.reduce<string[]>((prevTopics, { topic }) => {
        prevTopics.unshift(topic);
        return prevTopics;
    }, []);
    const [data, setData] = useState<DataByTopic>({});
    const { loading, error } = useSubscription<SubRslt>(DataSubscription, {
        onSubscriptionData: async res => {
            const { data: subData } = res.subscriptionData;
            if (subData) {
                const newDataPacket = subData.mqttTopics;
                if (data[newDataPacket.topic]) {
                    data[newDataPacket.topic].unshift(newDataPacket.data);
                    setData(data);
                } else {
                    data[newDataPacket.topic] = [newDataPacket.data];
                    console.log(`${newDataPacket.topic} topic added.`);
                    setData(data);
                }
            } else {
                console.warn("Received empty data packet.");
            }
        },
        variables: { topicList: allTopics }
    });

    if (error) {
        return (<div>{getErrorMessage(error)}</div>)
    }
    const renderedData = props.dataElements.map(({ graphProps, topic }, index) => {
        return (<LineGraph {...graphProps} data={data[topic]} key={"Graph-" + index.toString()} />)
    });
    if (!loading && !error) {
        return (<div>
            {renderedData}
        </div>)
    }
    return (<div>Loading...</div>)
}

export default controlPanel;