import LineGraph, { LineGraphProps } from "./LineGraph";
import gql from 'graphql-tag';
import { useState } from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { getErrorMessage } from '../lib/form';

interface DataElementProps {
    graphProps: LineGraphProps,
    topics: string[],
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

const controlPanel = (props: ControlPanelProps) => {
    const allTopics = props.dataElements.reduce<string[]>((prevTopics, { topics }) => {
        return [...prevTopics, ...topics];
    }, []);
    console.log(allTopics);
    const [sensorData, setSensorData] = useState<string>("");
    const { data, loading, error } = useSubscription(DataSubscription, {
        // onSubscriptionData: res => {
        //     console.log(res.subscriptionData);
        // },
        variables: { topicList: allTopics }
    });

    if (error) {
        console.error(getErrorMessage(error));
        return (<div>{getErrorMessage(error)}</div>)
    }

    if (loading) {
        return (<div>Loading...</div>)
    }

    // const renderedData = props.dataElements.map(({ graphProps, topics }) => {
    //     return (<LineGraph {...graphProps} />)
    // })
    if (!loading && !error) {
        console.log(data);
        return (<div>
            {data.mqttTopics.data}
        </div>)
    }
}

export default controlPanel;