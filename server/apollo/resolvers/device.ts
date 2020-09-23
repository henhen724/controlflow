import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx } from "type-graphql";
import { GraphQLJSON, GraphQLIPv4 } from "graphql-scalars"

import DeviceModel from "../../models/Device";

@ObjectType()
class Device {
    @Field(type => GraphQLIPv4)
    ip: string;
    @Field()
    port: number;
    @Field()
    secure: boolean;
    @Field()
    uri: string;
    @Field()
    name: string;
    @Field()
    platform: string;
    @Field()
    osName: string;
    @Field(type => GraphQLJSON)
    deviceSchema: Object;
    @Field()
    connected: boolean;
}

@Resolver()
class DeviceResolver {
    @Query(returns => [Device])
    async devices(): Promise<Device[]> {
        return await DeviceModel.find({}).exec();
    }
    @Query(returns => Device, { nullable: true })
    async deviceByIp(@Arg("ip") ip: string): Promise<Device | null> {
        return await DeviceModel.findOne({ ip }).exec();
    }
}

export default DeviceResolver;