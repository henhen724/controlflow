import { ApolloError, gql, useMutation, useLazyQuery, useQuery, QueryHookOptions, MutationHookOptions, MutationTuple, QueryResult, useSubscription, SubscriptionHookOptions } from '@apollo/client';

export const ArchiveCSVGQL = gql`
query CSVQuery($topic:String!, $from:Timestamp, $to:Timestamp, $first:Int, $after:Timestamp) {
    archiveDataCSVFile(topic: $topic, from: $from, to: $to, first: $first, after: $after)
}
`

export interface ArchiveDataQueryInput {
    topic: string;
    from?: Date;
    to?: Date;
    first?: number;
    after?: number;
    stopDownloading?: boolean;
}

interface ArchiveCSVOutput {
    archiveDataCSVFile: string;
}

export const ArchiveCSVDownload = (opts?: QueryHookOptions<ArchiveCSVOutput, ArchiveDataQueryInput>) => useLazyQuery<ArchiveCSVOutput, ArchiveDataQueryInput>(ArchiveCSVGQL, opts);

export const ArchiveDataQueryGQL = gql`
query ArchiveDataQuery($topic:String!, $from:Timestamp, $to:Timestamp, $first:Int, $after:Timestamp) {
    archiveData(topic: $topic, from: $from, to: $to, first: $first, after: $after) {
        edges {
            node{
                data
            }
        }
        pageInfo {
            endCursor
            hasNextPage
        }
    }
}
`

interface edge {
    node: {
        data: Object
    }
}

interface DataQueryOutput {
    edges: [edge];
    pageInfo: {
        endCursor: number;
        hasNextPage: boolean;
    }
}

export interface ArchiveDataOutput {
    archiveData: DataQueryOutput
}

export const ArchiveDataPreview = (opts?: QueryHookOptions<ArchiveDataOutput, ArchiveDataQueryInput>) => useLazyQuery(ArchiveDataQueryGQL, opts);


export const TopicsQueryGQL = gql`
query TopicsQuery {
    topicInfos {
        topic
        earliest
        latest
        size
      	recording
    }
}
`

export interface TopicInfo {
    topic: string;
    expires: boolean;
    experationTime: number;
    sizeLimited: boolean;
    maxSize: number;
    freqLimited: boolean;
    maxFreq: number;
    currSize: number;
    recordArchive: Boolean;
    recordRollingBuffer: Boolean;
    earliest: number;
    latest: number;
    size: number;
    archiveSize: number;
    rollingBufferSize: number;
}

export interface AbrvTopicInfo {
    topic: string;
    earliest?: number;
    latest?: number;
    size: number;
    recording: boolean
}

export interface TopicsQueryRslt {
    topicInfos: AbrvTopicInfo[]
}

export const TopicsQuery = (opts: QueryHookOptions<TopicsQueryRslt, {}>) => useQuery<TopicsQueryRslt, {}>(TopicsQueryGQL, opts);

interface SuccessBoolean {
    success: Boolean
}


export const TopicsSubscriptionGQL = gql`
subscription AllTopicSub {
  mqttTopics(topics:["#"]) {
    topic
  }
}
`

export interface TopicSubRslt {
    mqttTopics: {
        topic: string
    }
}

export const TopicsSubscription = (opts: SubscriptionHookOptions<TopicSubRslt, {}>) => useSubscription<TopicSubRslt, {}>(TopicsSubscriptionGQL, opts);

export interface RecordTopicInput {
    topic: string,
    experationTime?: number,
    maxSize?: number,
}

export const RecordTopicGQL = gql`
mutation RecordTopic($topic:String!, $experationTime: Int, $maxSize: Int, $recordArchive: Boolean, $recordRollingBuffer: Boolean) {
  recordTopic(topic: $topic, experationTime: $experationTime, maxSize: $maxSize, recordArchive: $recordArchive, recordRollingBuffer: $recordRollingBuffer) {
    success
  }
}
`

export const RecordTopic = (opts?: MutationHookOptions<SuccessBoolean, RecordTopicInput>) => useMutation<SuccessBoolean, RecordTopicInput>(RecordTopicGQL, opts);

export const DeleteTopicGQL = gql`
mutation DeleteTopicRecord($topic:String!) {
    deleteTopicRecord(topic:$topic) {
        success
    }
}
`

export const DeleteTopicRecord = (opts?: MutationHookOptions<SuccessBoolean, { topic: string }>): MutationTuple<SuccessBoolean, { topic: string }> => useMutation<SuccessBoolean, { topic: string }>(DeleteTopicGQL, opts);