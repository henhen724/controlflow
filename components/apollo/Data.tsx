import { gql, useMutation, MutationTuple, useQuery, QueryHookOptions, MutationHookOptions, SubscriptionHookOptions, QueryResult, useSubscription } from '@apollo/client';
import { BufferInfo } from '../../server/models/TopicBufferInfo';

export const DataQueryGQL = gql`
query DataQuery($topic:String!) {
    topicBuffer(topic:$topic) {
        data
    }
}
`

interface DataPacket {
    data: { [key: string]: string | number };
}

export interface DataQueryRslt {
    topicBuffer: DataPacket[];
}

export const DataQuery = (opts: QueryHookOptions<DataQueryRslt, {}>): QueryResult<DataQueryRslt, {}> => useQuery<DataQueryRslt, {}>(DataQueryGQL, opts);

export const DataSubscriptionGQL = gql`
subscription getData($topicList: [String!]!) {
  mqttTopics(topics: $topicList) {
      data
  }
}
`

interface DataSubRslt {
    mqttTopics: { data: Object };
}

export const DataSubscription = (opts: SubscriptionHookOptions<DataSubRslt, {}>) => useSubscription<DataSubRslt, {}>(DataSubscriptionGQL, opts);

export const SendMqttPacketGQL = gql`
mutation sendData($topic:String!, $payload:JSON!){
  mqttPublish(topic:$topic, payload:$payload) {
    success
  }
}
`

interface SuccessBoolean {
    success: Boolean;
}

interface PublishVars {
    topic: string;
    payload: Object;
}

export const SendMqttPacket = (opts?: MutationHookOptions<SuccessBoolean, PublishVars>) => useMutation<SuccessBoolean, PublishVars>(SendMqttPacketGQL, opts);