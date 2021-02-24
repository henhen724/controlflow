import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Float, Ctx, Args, Root } from "type-graphql";
import { GraphQLJSON, GraphQLTimestamp } from "graphql-scalars";
import { Document, Model } from 'mongoose';
import { v4 } from 'uuid';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { Transform as CSVTransform } from 'json2csv';
import { Transform, TransformCallback, pipeline } from 'stream';

import SuccessBoolean from "../types/SuccessBoolean";

import TopicInfoModel, { DBTopicInfo } from "../../models/TopicBufferInfo";
import { findBufferSize } from "../../lib/findBufferSize";
import DataPacketModel from "../../models/DataPacket";

import { findArchiveSize } from "../../lib/findBufferSize";
import ArchiveDataPacketModel, { ArchiveDataPacket } from "../../models/ArchiveDataPacket";
import { ConnectionInput, createConnectionOutput } from "../types/Connection";

import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import mqttConnect from '../../lib/mqttConnect';

const client = mqttConnect("👽", "Server");
const mqttPubSub = new MQTTPubSub({ client, includeFullPacketInfo: true });


@ObjectType()
class TopicInfo {
    @Field()
    topic: string;
    @Field()
    expires: boolean;
    @Field(type => Int, { nullable: true })
    experationTime: number;
    @Field()
    sizeLimited: boolean;
    @Field(type => Int, { nullable: true })
    maxSize: number;
    @Field()
    freqLimited: boolean;
    @Field(type => Float, { nullable: true })
    maxFreq: number;
    @Field(type => Boolean)
    recording!: Boolean;
    @Field(type => Boolean)
    recordArchive!: Boolean;
    @Field(type => Boolean)
    recordRollingBuffer!: Boolean;
    @Field(type => GraphQLTimestamp, { nullable: true })
    earliest: Date;
    @Field(type => GraphQLTimestamp, { nullable: true })
    latest: Date;
    @Field(type => Int)
    size: number;
    @Field(type => Int)
    archiveSize: number;
    @Field(type => Int)
    rollingBufferSize: number;
}

@ObjectType()
class DataPacket {
    @Field()
    topic: string;
    @Field(type => GraphQLTimestamp)
    created: Date;
    @Field(type => GraphQLJSON, { description: "The mqtt payload parsed as JSON.  If it parse fails, returns an empty object." })
    data: Object;
    @Field(type => String, { description: "This feild is the rawBytes of the mqtt packet UTF-8 encoded.  It is only included if the packet is not valid json.", nullable: true })
    rawData?: Buffer;
}

@ArgsType()
class MqttPublishInput {
    @Field()
    topic: string;
    @Field(type => GraphQLJSON)
    payload: Object;
}

@ArgsType()
class RecordTopicInput {
    @Field()
    topic: string;
    @Field()
    recordRollingBuffer: boolean;
    @Field()
    recordArchive: boolean;
    @Field({ nullable: true })
    freqLimited?: boolean;
    @Field(type => Float, { nullable: true })
    maxFreq?: number;
    @Field({ nullable: true })
    expires?: boolean;
    @Field(type => Int, { nullable: true })
    experationTime?: number;
    @Field({ nullable: true })
    sizeLimited?: boolean;
    @Field(type => Int, { nullable: true })
    maxSize?: number;
}

@ArgsType()
class MqttTopicInput {
    @Field(type => [String])
    topics: string[];
}

// New archive objects

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

@Resolver()
class TopicResolver {
    @Query(returns => [TopicInfo])
    async topicInfos() {
        const topicInfos = await TopicInfoModel.find({}).exec() as DBTopicInfo[];
        const topicMoreInfo = [];
        const archiveStatistics = (await ArchiveDataPacketModel.aggregate([
            { $group: { _id: "$topic", latest: { $max: "$created" }, earliest: { $min: "$created" } } }
        ]));
        for (var i = 0; i < topicInfos.length; i++) {
            const newTopicInfo = topicInfos[i] as TopicInfo;
            newTopicInfo.rollingBufferSize = (await findBufferSize(newTopicInfo.topic)).total_size;
            const stats = archiveStatistics.find((stats: any) => newTopicInfo.topic === stats._id);
            if (stats) {
                newTopicInfo.earliest = stats.earliest;
                newTopicInfo.latest = stats.latest;
            }
            newTopicInfo.archiveSize = (await findArchiveSize(newTopicInfo.topic)).total_size;
            newTopicInfo.size = newTopicInfo.archiveSize + newTopicInfo.rollingBufferSize;
            newTopicInfo.recording = newTopicInfo.recordArchive || newTopicInfo.recordRollingBuffer;
            topicMoreInfo.push(newTopicInfo);
        }
        return topicMoreInfo;
    }
    @Query(returns => [DataPacket])
    async topicBuffer(@Arg("topic") topic: string) {
        return await DataPacketModel.find({ topic }).exec();
    }

    @Mutation(returns => SuccessBoolean)
    async mqttPublish(@Args() input: MqttPublishInput) {
        const { topic, payload } = input;
        return { success: mqttPubSub.publish(topic, payload) };
    }
    @Mutation(returns => SuccessBoolean)
    async recordTopic(@Args() input: RecordTopicInput) {
        const { topic, freqLimited, maxFreq, expires, experationTime, sizeLimited, maxSize } = input;
        const topicInfos = await TopicInfoModel.find({ topic }) as Document<DBTopicInfo>[];
        switch (topicInfos.length) {
            case 0:
                const newBufInfo = new TopicInfoModel(input);
                await newBufInfo.save();
                return { success: true };
            case 1:
                await (TopicInfoModel as Model<Document<DBTopicInfo>>).updateOne({ topic }, input);
                return { success: true };
            default:
                throw new Error(`Topic ${topic} has ${topicInfos.length} topic info entries, but topic topic info must be unique.`);
        }
    }
    @Mutation(returns => SuccessBoolean)
    async deleteTopicBuffer(@Arg("topic") topic: string) {
        await TopicInfoModel.deleteMany({ topic }).exec();
        await DataPacketModel.deleteMany({ topic }).exec();
        return { success: true };
    }

    @Subscription(returns => DataPacket, { subscribe: (root, args) => mqttPubSub.asyncIterator(args.topics) })
    mqttTopics(@Root() mqttPacket: { topic: string, parsedMessage: Object, payload: Buffer }, @Args() args: MqttTopicInput): DataPacket {
        if (typeof mqttPacket.parsedMessage === 'object')
            return { topic: mqttPacket.topic, data: mqttPacket.parsedMessage, created: new Date() };
        else
            return { topic: mqttPacket.topic, data: {}, created: new Date(), rawData: mqttPacket.payload }
    }
    // Mutations and Queries for archives
    @Query(returns => String)
    async archiveDataCSVFile(@Args() input: ArchiveDataInput, @Ctx() ctx: { s3: S3 }): Promise<String> {
        const { topic, from, to } = input;
        //console.log("starting csv query.");
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
                if (data.length > 100000) {
                    //console.log("Sending megabyte");
                    this.push(Buffer.from(data, 'utf-8'));
                    data = "";
                }
                callback();
            },
            flush(callback: TransformCallback) {
                this.push(Buffer.from(data, 'utf-8'));
                data = "";
                callback();
            }
        });
        const csvStream = pipeline(ArchiveDataPacketModel.find(query).cursor({ batchSize: 10000 }), getDataTransform,
            json2csv,
            bufferTranform,
            (err: any) => {
                if (err) {
                    console.error(err);
                }
            });

        const fileName = `${topic}-${v4()}.csv`;

        const resData = await new Promise<{ Location: string }>(accept => {
            ctx.s3.upload(
                {
                    Bucket: 'widaq-csv-download', Key: fileName, Body: csvStream,
                    Expires: new Date(Date.now() + 60 * 60 * 1000), ACL: 'public-read'
                },
                (err: any, data: ManagedUpload.SendData) => {
                    if (err)
                        console.log(err);
                    accept(data);
                }
            );
            setTimeout(() => accept({ Location: `https://widaq-csv-download.s3.amazonaws.com/${fileName}` }), 119 * 1000) //If the request is about to timeout, guess the bucket location and respond.
        });

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
    async deleteTopicArchive(@Arg("topic") topic: string) {
        await TopicInfoModel.deleteMany({ topic }).exec();
        await ArchiveDataPacketModel.deleteMany({ topic }).exec();
        return { success: true };
    }
}

export default TopicResolver;