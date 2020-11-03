import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx, Args, Root } from "type-graphql";
import { GraphQLJSON, GraphQLTimestamp } from "graphql-scalars";

import SuccessBoolean from "../types/SuccessBoolean";

import TopicArchive from "../../models/TopicArchive";
import ArchiveDataPacket from "../../models/ArchiveDataPacket";


@ObjectType()
class ArchiveInfo {
    @Field()
    topic: string;
}

@ObjectType()
class ArchivePacket {
    @Field()
    topic: string;
    @Field(type => GraphQLTimestamp)
    created: Date;
    @Field(type => GraphQLJSON)
    data: Object;
}

@ArgsType()
class ArchiveTopicInput {
    @Field()
    topic: string;
}

@ArgsType()
class TimeRange {
    @Field()
    start: Date
    @Field()
    end: Date
}

@ArgsType()
class ArchiveDataInput {
    @Field()
    topic: string;
    @Field(type => GraphQLTimestamp)
    from: Date;
    @Field(type => GraphQLTimestamp)
    to: Date;
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

    @Query(returns => [ArchivePacket])
    async archiveData(@Args() input: ArchiveDataInput) {
        const { topic, from, to } = input;
        var query = { topic } as { topic: string, created?: { $gte?: Date, $lte?: Date } };
        if (from || to) {
            query = {
                ...query,
                created: {}
            }
            if (from)
                query.created = { ...query.created, $gte: from }
            if (to)
                query.created = { ...query.created, $lte: to }
        }
        return await ArchiveDataPacket.find(query).exec();
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