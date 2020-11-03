import { gql, useMutation, useQuery, QueryHookOptions, MutationHookOptions, SubscriptionHookOptions, QueryResult, useSubscription } from '@apollo/client';


interface DataPacket {
    data: { [key: string]: string | number };
}

export interface DataQueryRslt {
    topicBuffer: DataPacket[];
}

// Rolling Buffer Query
export const DataQueryGQL = gql`
query DataQuery($topic:String!) {
    topicBuffer(topic:$topic) {
        data
    }
}
`
// This queries data from rolling buffers (ie. the small data buffers on mongoDB server which remove data after the buffer over runs it memory limit or packets expire).
export const DataQuery = (opts: QueryHookOptions<DataQueryRslt, {}>): QueryResult<DataQueryRslt, {}> => useQuery<DataQueryRslt, {}>(DataQueryGQL, opts);


// Archive Data Query
export const ArchiveDataQueryGQL = gql`
query ArchiveDataQuery($topic:String!, $from:Timestamp, $to:Timestamp) {
    archiveData(topic:$topic, from:$from, to:$to) {
        data
    }
}
`
// This queries data from the archive (ie. long term storage which will take longer to return a result, but never deletes data).
export const ArchiveDataQuery = (opts: QueryHookOptions<DataQueryRslt, {}>): QueryResult<DataQueryRslt, {}> => useQuery<DataQueryRslt, {}>(ArchiveDataQueryGQL, opts);

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