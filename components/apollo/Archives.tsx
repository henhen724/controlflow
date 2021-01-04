import { ApolloError, gql, useMutation, useLazyQuery, useQuery, QueryHookOptions, MutationHookOptions } from '@apollo/client';
import { TopicArchive } from '../../server/models/TopicArchive';
import { useState } from 'react';

export const ArchiveDataQueryGQL = gql`
query ArchiveDataQuery($topic:String!, $from:Timestamp, $to:Timestamp, $first:Int, $after:ID) {
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
export interface ArchiveDataQueryInput {
    topic: string;
    from?: Date;
    to?: Date;
    first?: number;
    after?: number;
}

interface edge {
    node: {
        data: Object
    }
}

export interface ArchiveDataOutput {
    archiveData: DataQueryOutput
}

interface DataQueryOutput {
    edges: [edge];
    pageInfo: {
        endCursor: number;
        hasNextPage: boolean;
    }
}


export const ArchiveDataQuery = (opts?: QueryHookOptions<ArchiveDataOutput, ArchiveDataQueryInput>) => useQuery<ArchiveDataOutput, ArchiveDataQueryInput>(ArchiveDataQueryGQL, opts);

export const LazyArchiveDataQuery = (opts?: QueryHookOptions<ArchiveDataOutput, ArchiveDataQueryInput>) => useLazyQuery<ArchiveDataOutput, ArchiveDataQueryInput>(ArchiveDataQueryGQL, opts);

export const fullArchiveDownload = (opts: QueryHookOptions<ArchiveDataOutput, ArchiveDataQueryInput>): [(newOpts?: QueryHookOptions<ArchiveDataOutput, ArchiveDataQueryInput>) => void, () => void, { data?: Object[], loading: boolean, error?: ApolloError, cursor?: number }] => {
    const [data, setData] = useState<Object[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApolloError | undefined>(undefined);
    const [cursor, setCursor] = useState<number | undefined>(undefined);

    const [getData, { data: newData, error: newError }] = LazyArchiveDataQuery(opts);

    const startLoadingData = (newOpts?: QueryHookOptions<ArchiveDataOutput, ArchiveDataQueryInput>) => {
        opts = {
            ...opts,
            ...newOpts
        }
        setError(newError);
        if (cursor) {
            opts.variables!.after = cursor;
        }
        opts.notifyOnNetworkStatusChange = true;
        console.log(opts)
        getData(opts);
    }

    const clearDownloadData = () => {
        setData([]);
        setLoading(true);
        setError(undefined);
        setCursor(undefined);
    }

    console.log("Download data:", newData);

    if (newData && (!cursor || newData!.archiveData.pageInfo.endCursor > cursor)) {
        console.log("Archive Data Q complete:", newData);
        setLoading(false);
        setData(data.concat(newData!.archiveData.edges.map(edge => edge.node.data)));
        setCursor(newData!.archiveData.pageInfo.endCursor);
        if (newData!.archiveData.pageInfo.hasNextPage)
            startLoadingData();
    }

    return [startLoadingData, clearDownloadData, { data, loading, error, cursor }];
}

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
mutation ArchiveTopic($topic: String!) {
    archiveTopic(topic: $topic) {
        success
    }
}
`

export const ArchiveTopic = (opts?: MutationHookOptions<{ success: boolean }, { topic: string }>) => useMutation<{ success: boolean }, { topic: string }>(ArchiveTopicGQL, opts);

export const DeleteTopicArchiveGQL = gql`
mutation DeleteTopicArchive($topic: String!) {
    deleteTopicArchive(topic:$topic) {
        success
    }
}
`

export const DeleteTopicArchive = (opts?: MutationHookOptions<{ success: boolean }, { topic: string }>) => useMutation<{ success: boolean }, { topic: string }>(ArchiveTopicGQL, opts);