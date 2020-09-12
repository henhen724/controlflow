import { GraphQLJSON, GraphQLDate } from 'graphql-scalars';

const gqlCustomTypes = {
    JSON: GraphQLJSON,
    Date: GraphQLDate,
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