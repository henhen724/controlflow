import { ApolloError, gql, useMutation, useLazyQuery, useQuery, QueryHookOptions, MutationHookOptions } from '@apollo/client';

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

export const ArchiveQueryGQL = gql`
query ArchivesQuery {
    runningArchives {
        topic
        earliest
        latest
        size
    }
}
`
export interface ArchiveInfo {
    topic: string;
    earliest?: number;
    latest?: number;
    size: number;
}

export interface ArchiveInfoRslt {
    runningArchives: ArchiveInfo[]
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

interface ArchiveDownloadState {
    data: Object[];
    loading: boolean;
    hasNextPage: boolean;
    error?: ApolloError;
    variables?: ArchiveDataQueryInput;
    progress?: number;
}

/*********
 * DEPRECATED METHODS FOLLOW
 *
 */

// export const useArchiveDownload = (): [ArchiveDownloadState, (variables: ArchiveDataQueryInput) => void] => {
//     const [state, setState] = useState<ArchiveDownloadState>({ data: [], loading: true, hasNextPage: false })

//     const reducer = async (state: ArchiveDownloadState, variables: ArchiveDataQueryInput): Promise<ArchiveDownloadState> => {
//         if (variables.stopDownloading) {
//             return { ...state, hasNextPage: false, variables };
//         }
//         if (!variables || !variables.topic)
//             throw new Error(`Download data started with out adiquit arguements: topic ${variables ? variables.topic : "NO VARAIBLE OBJECT"}`);
//         const { data: newData, error: newError } = await myApolloClient.query<ArchiveDataOutput, ArchiveDataQueryInput>({ query: ArchiveDataQueryGQL, variables });
//         if (newData) {
//             var newRowData = newData!.archiveData.edges.map(edge => edge.node.data);
//             newRowData.push(...state.data);
//             const currTime = newData!.archiveData.pageInfo.endCursor;
//             let progress;
//             if (variables.from && variables.to) {
//                 progress = (currTime - variables.from.getTime()) / (variables.to.getTime() - variables.from.getTime()) * 100;
//             }
//             return {
//                 data: newRowData, loading: false,
//                 hasNextPage: newData!.archiveData.pageInfo.hasNextPage,
//                 error: newError,
//                 variables: {
//                     ...variables,
//                     after: currTime,
//                 },
//                 progress
//             };
//         }
//         return { ...state, loading: false, error: newError }
//     }

//     const setLoading = async (variables: ArchiveDataQueryInput) => {
//         const nextState = await reducer(state, variables);
//         setState(nextState);
//     }

//     if (state.hasNextPage && state.variables && !state.variables.stopDownloading) {
//         setLoading(state.variables)
//     } else if (state.variables && state.variables.stopDownloading) {
//         setState({ data: [], loading: true, hasNextPage: false });
//     }

//     return [state, setLoading];
// }