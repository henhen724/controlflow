import { gql, useMutation, MutationTuple, useQuery, QueryHookOptions, MutationHookOptions, QueryResult } from '@apollo/client';
import { BufferInfo } from '../../server/models/TopicBufferInfo';

export const BufferQueryGQL = gql`
query BuffersQuery {
    runningBuffers {
        topic
        expires
        experationTime
        sizeLimited
        maxSize
        currSize
    }
}
`

export interface BufferQueryRslt {
    runningBuffers: BufferInfo[]
}

export const BufferQuery = (opts: QueryHookOptions<BufferQueryRslt, {}>): QueryResult<BufferQueryRslt, {}> => useQuery<BufferQueryRslt, {}>(BufferQueryGQL, opts);

interface SuccessBoolean {
    success: Boolean
}

export interface BufferPacket {
    topic: string,
    experationTime?: number,
    maxSize?: number,
}

export const RecordTopicGQL = gql`
mutation RecordTopic($topic:String!, $experationTime: Int, $maxSize: Int) {
  recordTopic(topic: $topic, experationTime: $experationTime, maxSize: $maxSize) {
    success
  }
}
`

export const RecordTopic = (opts?: MutationHookOptions<SuccessBoolean, BufferPacket>) => useMutation<SuccessBoolean, BufferPacket>(RecordTopicGQL, opts);

export const DeleteTopicGQL = gql`
mutation DeleteTopicBuffer($topic:String!) {
    deleteTopicBuffer(topic:$topic) {
        success
    }
}
`

export const DeleteTopic = (opts?: MutationHookOptions<SuccessBoolean, { topic: string }>): MutationTuple<SuccessBoolean, { topic: string }> => useMutation<SuccessBoolean, { topic: string }>(DeleteTopicGQL, opts);