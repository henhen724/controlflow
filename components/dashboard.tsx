import { DataComponent, UnionDataPanelProps } from './DataPanel/index';
import { ControlComponent, UnionControlPanelProps } from './ControlPanel/index';
import gql from 'graphql-tag';
import { useState } from 'react';
import { useSubscription, useMutation } from '@apollo/react-hooks';
import { getErrorMessage } from '../lib/form';


const DataSubscription = gql`
subscription getData($topicList: [String]!) {
  mqttTopics(topics: $topicList) {
      data
  }
}
`
const SendMqttPacket = gql`
mutation sendData($topic:String!, $payload:JSON){
  mqttPublish(input:{topic:$topic, payload:$payload}) {
    success
  }
}
`

export type PanelProps = UnionDataPanelProps | UnionControlPanelProps;

interface DashboardProps {
    dataElements: PanelProps[],
}

interface DataByTopic {
    [key: string]: Object[]
}

interface SubRslt {
    mqttTopics: { data: Object }
}

const dashboard = (props: DashboardProps) => {
    const [data, setData] = useState<DataByTopic>({});
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [mqttPublish] = useMutation(SendMqttPacket);
    const allTopics = props.dataElements.reduce<string[]>((prevTopics, { topic }) => {
        prevTopics.unshift(topic);
        return prevTopics;
    }, []);
    console.log(allTopics);
    allTopics.forEach(topic => {
        console.log(`Adding ${topic} sub`);
        useSubscription<SubRslt>(DataSubscription, {
            variables: { topicList: [topic] },
            onSubscriptionData: async res => {
                if (res.subscriptionData.error) {
                    setErrorMsg(getErrorMessage(res.subscriptionData.error));
                    return;
                }
                const subData = res.subscriptionData;
                if (subData) {
                    if (subData.data && subData.data.mqttTopics) {
                        const message = subData.data.mqttTopics.data;
                        console.log(message);
                        if (data[topic]) {
                            data[topic].unshift(message);
                            setData(data);
                        } else {
                            data[topic] = [message];
                            console.log(`${topic} topic added.`);
                            setData(data);
                        }
                    } else {
                        console.warn("Received empty data packet.");
                    }
                }
            }
        });
    });
    const renderedData = props.dataElements.map((PanelElementProps, index) => {
        var panel = (<h1>Error:No panel loaded</h1>);
        switch (PanelElementProps.elemType) {
            case "data":
                panel = (<DataComponent props={PanelElementProps} data={data} />);
                break;
            case "control":
                panel = (<ControlComponent props={PanelElementProps} sendMqttPacket={mqttPublish} data={data} />);
                break;
        }
        return (<div className="panel-wraper" key={index.toString() + "-panel"}>
            {panel}
        </div>)
    });
    if (true) {
        return (<div>
            {errorMsg ? (<div className="alert alert-warning" role="alert">{errorMsg}</div>) : (<div></div>)}
            {renderedData}
        </div>)
    }
    return (<div>Loading Dashboard...</div>)
}

export default dashboard;