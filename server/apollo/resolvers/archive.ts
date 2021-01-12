import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Field, Int, ID, Args, Ctx } from "type-graphql";
import { GraphQLJSON, GraphQLTimestamp } from "graphql-scalars";
import { v4 } from 'uuid';
import { S3 } from 'aws-sdk';
import { Transform as CSVTransform } from 'json2csv';
import { Transform, TransformCallback } from 'stream';

import { findArchiveSize } from "../../lib/findBufferSize";
import SuccessBoolean from "../types/SuccessBoolean";
import TopicArchive from "../../models/TopicArchive";
import ArchiveDataPacketModel, { ArchiveDataPacket } from "../../models/ArchiveDataPacket";
import { ConnectionInput, createConnectionOutput } from "../types/Connection";
import { ManagedUpload } from 'aws-sdk/clients/s3';


@ObjectType()
class ArchiveInfo {
    @Field()
    topic: string;
    @Field(type => GraphQLTimestamp, { nullable: true })
    earliest: Date;
    @Field(type => GraphQLTimestamp, { nullable: true })
    latest: Date;
    @Field(type => Int)
    size: number;
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

const flattenObject = (ob: any) => {
    var toReturn: any = {};
    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

const getDataTransform = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk: ArchiveDataPacket, encoding: BufferEncoding, callback: TransformCallback) {
        if (chunk)
            this.push(flattenObject(chunk.data));
        callback();
    }
});

let data = "";

const bufferTranform = new Transform({
    transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
        data += chunk.toString();
        if (data.length > 1000000) {
            this.push(data);
            data = "";
        }
        callback();
    },
    flush(callback: TransformCallback) {
        this.push(data);
        data = "";
        callback();
    }
});

@Resolver()
class ArchiveResolver {
    @Query(returns => [ArchiveInfo])
    async runningArchives() {
        const archives = await TopicArchive.find({}).exec();
        const archiveMoreInfo = [];
        const archiveStatistics = (await ArchiveDataPacketModel.aggregate([
            { $group: { _id: "$topic", latest: { $max: "$created" }, earliest: { $min: "$created" } } }
        ]));
        for (var i = 0; i < archives.length; i++) {
            const archive = archives[i] as { topic: string, earliest?: Date, latest?: Date, size?: number };
            const stats = archiveStatistics.find((stats: any) => archive.topic === stats._id);
            if (stats) {
                archive.earliest = stats.earliest;
                archive.latest = stats.latest;
            }
            archive.size = (await findArchiveSize(archive.topic)).total_size;
            archiveMoreInfo.push(archive);
        }
        return archiveMoreInfo;
    }

    @Query(returns => String)
    async archiveDataCSVFile(@Args() input: ArchiveDataInput, @Ctx() ctx: { s3: S3 }): Promise<String> {
        const { topic, from, to } = input;
        var query = { topic } as { topic: string, created?: { $gte?: Date, $lte?: Date } };
        query = {
            ...query
        }
        if (from || to)
            query = { created: {}, ...query }
        if (from)
            query.created = { ...query.created, $gte: from }
        if (to)
            query.created = { ...query.created, $lte: to }

        const exampleObject = await ArchiveDataPacketModel.findOne(query);

        if (!exampleObject)
            return "";

        const json2csv = new CSVTransform({ fields: Object.keys(flattenObject(exampleObject.data)) }, { objectMode: true, encoding: 'utf-8' });
        const csvStream = ArchiveDataPacketModel.find(query).cursor({ batchSize: 10000 }).pipe(getDataTransform).pipe(json2csv).pipe(bufferTranform);

        const fileName = `${topic}-${v4()}.csv`;

        const resData = await new Promise<ManagedUpload.SendData>(accept => ctx.s3.upload({ Bucket: 'widaq-csv-download', Key: fileName, Body: csvStream, Expires: new Date(Date.now() + 24 * 60 * 60 * 1000), ACL: 'public-read' }, (err: any, data: ManagedUpload.SendData) => {
            if (err)
                console.log(err);
            accept(data);
        }));

        return resData.Location;
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
        const nodes = await ArchiveDataPacketModel.find(query).limit(first + 1).exec();
        if (nodes.length === 0) {
            return { edges: [], pageInfo: { hasNextPage: false, endCursor: 0 } }
        }
        const hasNextPage = nodes.length > first;
        const edges = nodes.splice(0, first).map((node: any) => {
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
        await ArchiveDataPacketModel.deleteMany({ topic }).exec();
        return { success: true };
    }
}

export default ArchiveResolver;