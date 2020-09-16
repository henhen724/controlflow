import { GraphQLJSON, GraphQLTimestamp, GraphQLIPv4 } from 'graphql-scalars';

const gqlCustomTypes = {
    IPv4: GraphQLIPv4,
    JSON: GraphQLJSON,
    Timestamp: GraphQLTimestamp,
    NotoChange: {
        __resolveType: (obj: any) => {
            switch (obj.operationType) {
                case "insert":
                    return 'NotoInsert';
                case "delete":
                    return 'NotoDelete';
                default:
                    return null;
            }
        }
    }
}

export default gqlCustomTypes;