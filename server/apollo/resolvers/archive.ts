import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Field, Int, ID, Args } from "type-graphql";
import { ApolloError } from 'apollo-server';
import { GraphQLJSON, GraphQLTimestamp } from "graphql-scalars";

import SuccessBoolean from "../types/SuccessBoolean";

import TopicArchive from "../../models/TopicArchive";
import ArchiveDataPacket from "../../models/ArchiveDataPacket";
import { ConnectionInput, createConnectionOutput } from "../types/Connection";


@ObjectType()
class ArchiveInfo {
    @Field()
    topic: string;
}

@ObjectType()
class ArchivePacket {
    @Field()
    topic: string;
    @Field(type => GraphQLJSON)
    data: Object;
}

const ArchiveConnectionOuput = createConnectionOutput(ArchivePacket);

@ArgsType()
class ArchiveTopicInput {
    @Field()
    topic: string;
}

@ArgsType()
class ArchiveDataInput extends ConnectionInput {
    @Field()
    topic: string;
    @Field(type => GraphQLTimestamp, { nullable: true })
    from?: Date;
    @Field(type => GraphQLTimestamp, { nullable: true })
    to?: Date;
}

@Resolver()
class ArchiveResolver {
    @Query(returns => [ArchiveInfo])
    async runningArchives() {
        const archives = await TopicArchive.find({}).exec();
        const archiveMoreInfo = [];
        for (var i = 0; i < archives.length; i++) {
            const archive = archives[i] as any;
            archiveMoreInfo.push(archive);
        }
        return archiveMoreInfo;
    }

    @Query(returns => ArchiveConnectionOuput)
    async archiveData(@Args() input: ArchiveDataInput) {
        const { topic, from, to, first, after } = input;
        var query = { topic } as { topic: string, created?: { $gte?: Date, $lte?: Date } };
        if (from || to || after) {
            query = {
                ...query,
                created: {}
            }
            if (from && after) {
                if (from < after) {
                    query.created = { ...query.created, $gte: after }
                } else {
                    query.created = { ...query.created, $gte: from }
                }
            } else {
                if (from) {
                    query.created = { ...query.created, $gte: from }
                }
                if (after) {
                    query.created = { ...query.created, $gte: after }
                }
            }
            if (to)
                query.created = { ...query.created, $lte: to }
        }
        const nodes = await ArchiveDataPacket.find(query).limit(first + 1).exec();
        if (nodes.length === 0) {
            throw new ApolloError("No data is available for the selected time range.", "NO_DATA");
        }
        const hasNextPage = nodes.length > first;
        const edges = nodes.splice(0, first).map(node => {
            return { node, cursor: node.created.getTime() }
        })
        const endCursor = edges[edges.length - 1].cursor;
        return { edges, pageInfo: { endCursor, hasNextPage } }
    }

    @Mutation(returns => SuccessBoolean)
    async archiveTopic(@Args() input: ArchiveTopicInput) {
        const { topic } = input;
        const archiveInfo = await TopicArchive.find({ topic });
        switch (archiveInfo.length) {
            case 0:
                const newBufInfo = new TopicArchive({
                    topic,
                })
                await newBufInfo.save();
                return { success: true };
            case 1:
                await archiveInfo[0].save();
                return { success: true };
            default:
                throw new Error(`Topic ${topic} has ${archiveInfo.length} archive info entries, but topic archive info must be unique.`);
        }
    }
    @Mutation(returns => SuccessBoolean)
    async deleteTopicArchive(@Arg("topic") topic: string) {
        await TopicArchive.deleteMany({ topic }).exec();
        await ArchiveDataPacket.deleteMany({ topic }).exec();
        return { success: true };
    }
}

export default ArchiveResolver;