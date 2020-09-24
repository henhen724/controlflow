import "reflect-metadata";
import { ObjectType, Arg, Args, ArgsType, Resolver, Query, Mutation, Subscription, Field, Root, PubSub, Publisher } from "type-graphql";
import { GraphQLJSON, GraphQLIPv4 } from "graphql-scalars"

import DeviceModel, { deviceSchema } from "../../models/Device";
import SuccessBoolean from '../types/SuccessBoolean';
import { UserInputError } from 'apollo-server';

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
    deviceSchema: deviceSchema;
    @Field()
    connected: boolean;
}

@ArgsType()
class ConnInput {
    @Field(type => GraphQLIPv4)
    ip: string;
    @Field()
    port: number;
    @Field()
    secure: boolean;
    @Field()
    name: string;
    @Field()
    platform: string;
    @Field()
    osName: string;
    @Field(type => GraphQLJSON)
    deviceSchema: deviceSchema;
}

@Resolver()
class DeviceResolver {
    @Query(returns => [Device])
    async devices(): Promise<Device[]> {
        return await DeviceModel.find({}).exec();
    }
    @Query(returns => Device, { nullable: true })
    async deviceByIp(@Arg("ip", type => GraphQLIPv4) ip: string): Promise<Device | null> {
        return await DeviceModel.findOne({ ip }).exec();
    }


    @Mutation(returns => SuccessBoolean, { description: "This route allows the worker to tell the server that a device has connected.  You do not need to call this route to connect a device." })
    async connect(@Args() device: ConnInput, @PubSub("CONNECT") publish: Publisher<Device>) {
        await DeviceModel.updateOne({ ip: device.ip }, device, (err, deviceM) => {
            if (err) throw new UserInputError(err);
            publish(deviceM);
        }).exec();

        return { success: true };
    }
    @Mutation(returns => SuccessBoolean, { description: "This route allows the worker to tell the server that a device has disconnected.  You do not need to call this route." })
    async disconnectByIp(@Arg("ip", type => GraphQLIPv4) ip: string, @PubSub("DISCONNECT") publish: Publisher<string>) {
        await DeviceModel.updateOne({ ip }, { connected: false }, (err: any) => {
            if (err) throw new UserInputError(err);
        }).exec();
        publish(ip);
        return { success: true };
    }
    @Mutation(returns => SuccessBoolean, { description: "Delete the record of a device. Will recreate if device reconnects to the MQTT broker." })
    async deleteByIp(@Arg("ip", type => GraphQLIPv4) ip: string, @PubSub("DELETE") publish: Publisher<string>) {
        await DeviceModel.deleteOne({ ip }, (err: any) => {
            throw new UserInputError(err);
        }).exec();
        publish(ip);
        return { success: true };
    }


    @Subscription(returns => Device, { topics: "CONNECT" })
    async watchDeviceConnect(@Root() device: Device) {
        return device;
    }
    @Subscription(returns => String, { topics: "DISCONNECT" })
    async watchDeviceDisconnect(@Root() ip: string) {
        return ip;
    }
}

export default DeviceResolver;