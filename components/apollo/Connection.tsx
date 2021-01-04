import { ApolloError, QueryHookOptions, QueryTuple } from '@apollo/client';
import { useState } from 'react';

interface ConnectionResult {
    loading: boolean;
    error?: ApolloError;
    data: Object[];
    cursor?: number;
}

interface ConnectionArgs {
    first?: number;
    after?: number;
}

interface ConnectionQueryOutput {
    edges: [{ node: any }];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: number;
    }
}

export const fullDownload = <Args extends ConnectionArgs>(queryFunction: (opts?: QueryHookOptions<ConnectionQueryOutput, Args>) => QueryTuple<ConnectionQueryOutput, Args>, variables?: Args): [() => void, ConnectionResult] => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApolloError | undefined>(undefined);
    const [cursor, setCursor] = useState<number | undefined>(undefined);
    var modifiedOpts = {
        variables: {}
    } as QueryHookOptions<ConnectionQueryOutput, Args>;
    if (variables)
        modifiedOpts.variables = variables;
    const [getData, { error: newError }] = queryFunction();
    const startLoadingData = () => {
        if (cursor) {
            modifiedOpts.variables!.after = cursor;
        }
        modifiedOpts.onCompleted = (newData: ConnectionQueryOutput) => {
            setLoading(false);
            setData(data.concat(newData.edges.map(edge => edge.node)));
            setCursor(newData.pageInfo.endCursor);
            if (newData.pageInfo.hasNextPage)
                startLoadingData();
        }
        getData(modifiedOpts);
        setError(newError);
    }

    return [startLoadingData, { data, loading, error, cursor }];
}
