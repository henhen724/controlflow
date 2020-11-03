import { gql, useMutation, useQuery, QueryHookOptions, MutationHookOptions } from '@apollo/client';
import { TopicArchive } from '../../server/models/TopicArchive';

export const ArchiveQueryGQL = gql`
query ArchivesQuery {
    runningArchives {
        topic
    }
}
`
export interface ArchiveInfoRslt {
    runningArchives: TopicArchive[]
}

export const ArchiveQuery = (opts?: QueryHookOptions<ArchiveInfoRslt, {}>) => useQuery<ArchiveInfoRslt, {}>(ArchiveQueryGQL, opts);

export const ArchiveTopicGQL = gql`
mutation ArchiveTopic($input: ArchiveTopicInput!) {
    archiveTopic(input: $input) {
        success
    }
}
`

export const ArchiveTopic = (opts?: MutationHookOptions<{ success: boolean }, { input: { topic: string } }>) => useMutation<{ success: boolean }, { input: { topic: string } }>(ArchiveTopicGQL, opts);

export const DeleteTopicArchiveGQL = gql`
mutation DeleteTopicArchive($topic: String!) {
    deleteTopicArchive(topic:$topic) {
        success
    }
}
`

export const DeleteTopicArchive = (opts?: MutationHookOptions<{ success: boolean }, { topic: string }>) => useMutation<{ success: boolean }, { topic: string }>(ArchiveTopicGQL, opts);;