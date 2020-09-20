import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx, Args, Root } from "type-graphql";
import { GraphQLJSON, GraphQLTimestamp } from "graphql-scalars";

import SuccessBoolean from "../types/SuccessBoolean";

import TopicBufferInfo from "../../models/TopicBufferInfo";
import findBufferSize from "../../lib/findBufferSize";
import DataPacketModel from "../../models/DataPacket";

import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import mqttConnect from '../../lib/mqttConnect';

const client = mqttConnect("👽", "Server");
const mqttPubSub = new MQTTPubSub({ client });

@ObjectType()
class DataPacket {
    @Field(type => GraphQLJSON)
    data: Object;
}

@ObjectType()
class BufferInfo {
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
    @Field(type => Int)
    currSize: number;
}

@ObjectType()
class BufferPacket {
    @Field()
    topic: string;
    @Field(type => GraphQLTimestamp)
    created: Date;
    @Field(type => GraphQLJSON)
    data: Object;
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
    @Field(type => Int)
    experationTime: number;
    @Field(type => Int)
    maxSize: number;
}

@ArgsType()
class MqttTopicInput {
    @Field(type => [String])
    topics: string[];
}

@Resolver()
class BufferResolver {
    @Query(returns => [BufferInfo])
    async runningBuffers() {
        const buffers = await TopicBufferInfo.find({}).exec();
        const bufferMoreInfo = [];
        for (var i = 0; i < buffers.length; i++) {
            const buffer = buffers[i] as any;
            buffer.currSize = (await findBufferSize(buffer.topic)).total_size;
            bufferMoreInfo.push(buffer);
        }
        return bufferMoreInfo;
    }
    @Query(returns => [BufferPacket])
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
        const { topic, experationTime, maxSize } = input;
        const expires = !!experationTime;
        const sizeLimited = !!maxSize;
        const bufferInfo = await TopicBufferInfo.find({ topic });
        switch (bufferInfo.length) {
            case 0:
                const newBufInfo = new TopicBufferInfo({
                    topic,
                    experationTime,
                    expires,
                    maxSize,
                    sizeLimited,
                })
                await newBufInfo.save();
                return { success: true };
            case 1:
                bufferInfo[0].experationTime = experationTime;
                bufferInfo[0].expires = expires;
                bufferInfo[0].maxSize = maxSize;
                bufferInfo[0].sizeLimited = sizeLimited;
                await bufferInfo[0].save();
                return { success: true };
            default:
                throw new Error(`Topic ${topic} has ${bufferInfo.length} buffer info entries, but topic buffer info must be unique.`);
        }
    }
    @Mutation(returns => SuccessBoolean)
    async deleteTopicBuffer(@Arg("topic") topic: string) {
        console.log(`Deleteing ${topic}`);
        await TopicBufferInfo.deleteMany({ topic }).exec();
        await DataPacketModel.deleteMany({ topic }).exec();
        return { success: true };
    }

    @Subscription(returns => DataPacket, { subscribe: ({ args }) => mqttPubSub.asyncIterator(args.topics) })
    mqttTopics(@Root() payload: Object, @Args() args: MqttTopicInput): DataPacket {
        return { data: payload };
    }
}

export default BufferResolver;