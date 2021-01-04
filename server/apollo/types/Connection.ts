import "reflect-metadata";
import { ArgsType, ObjectType, Field, ID, Int } from "type-graphql";
import { GraphQLJSON, GraphQLTimestamp } from "graphql-scalars";

@ArgsType()
export class ConnectionInput {
    @Field(type => Int)
    first: number = 100;
    @Field(type => ID, { nullable: true })
    after?: number;
}
export const createConnectionOutput = (nodeType: any) => {
    @ObjectType()
    class Edge {
        @Field(type => nodeType)
        node: any;
        @Field(type => ID)
        cursor: number;
    }

    @ObjectType()
    class PageInfo {
        @Field(type => ID)
        endCursor: number;
        @Field()
        hasNextPage: boolean;
    }

    @ObjectType()
    class ConnectionOutput {
        @Field(type => [Edge])
        edges: [Edge];
        @Field()
        pageInfo: PageInfo;
    }
    return ConnectionOutput
}