import { gql, MutationTuple, useQuery, QueryHookOptions, useMutation, MutationHookOptions, QueryResult } from '@apollo/client';
import { Watchdog } from '../../server/models/Watchdog';

export const WatchdogsQueryGQL = gql`
query WatchdogsQuery {
    watchdogs {
        name
        topics
        messageString
    }
}
`

interface WatchdogQueryRslt {
    watchdogs: Watchdog[];
}

export const WatchdogsQuery = (opts: QueryHookOptions<WatchdogQueryRslt, {}>): QueryResult<WatchdogQueryRslt, {}> => useQuery<WatchdogQueryRslt, {}>(WatchdogsQueryGQL, opts);

interface SuccessBoolean {
    success: boolean;
}

export const SetWatchdogGQL = gql`
mutation SetWatchdog($name:String!, $topics:[String!]!, $messageString:String!) {
  setWatchdog(name:$name, topics:$topics, messageString:$messageString) {
    success
  }
}
`

export const SetWatchdog = (opts?: MutationHookOptions<SuccessBoolean, Watchdog>) => useMutation<SuccessBoolean, Watchdog>(SetWatchdogGQL, opts);

export const DeleteWatchdogGQL = gql`
mutation DeleteWatchdog($name:String!) {
    deleteWatchdog(name:$name) {
        success
    }
}
`

export const DeleteWatchdog = (opts?: MutationHookOptions<SuccessBoolean, { name: string }>): MutationTuple<SuccessBoolean, { name: string }> => useMutation<SuccessBoolean, { name: string }>(DeleteWatchdogGQL, opts);