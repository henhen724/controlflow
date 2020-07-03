import LineGraph, { LineGraphProps } from "./LineGraph";
import gql from 'graphql-tag';
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
        message
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
    const { data, loading, error } = useSubscription(DataSubscription, { variables: { topicList: allTopics } });

    if (error) console.error(getErrorMessage(error));

    if (!loading) {
        console.log(data);
    }

    // const renderedData = props.dataElements.map(({ graphProps, topics }) => {
    //     return (<LineGraph {...graphProps} />)
    // })
    return (<div>

    </div>)
}

export default controlPanel;