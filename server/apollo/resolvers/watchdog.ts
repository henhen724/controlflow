import "reflect-metadata";
import { ObjectType, ArgsType, Args, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx } from "type-graphql";

import SuccessBoolean from "../types/SuccessBoolean";

import WatchdogModel from "../../models/Watchdog";


@ObjectType()
class Watchdog {
    @Field()
    name: string;
    @Field(type => [String])
    topics: string[];
    @Field()
    messageString: string;
}

@ArgsType()
class SetWatchdogInput {
    @Field()
    name: string;
    @Field(type => [String])
    topics: string[];
    @Field()
    messageString: string;
}

@Resolver()
class WatchdogResolver {
    @Query(returns => [Watchdog])
    async watchdogs() {
        return await WatchdogModel.find({}).exec();
    }

    @Mutation(returns => SuccessBoolean)
    async setWatchdog(@Args() input: SetWatchdogInput) {
        const { name, topics, messageString } = input;
        const thisWatchdog = await WatchdogModel.find({ name });
        switch (thisWatchdog.length) {
            case 0:
                const newDogInfo = new WatchdogModel({ name, topics, messageString });
                await newDogInfo.save();
                return { success: true };
            case 1:
                thisWatchdog[0].name = name;
                thisWatchdog[0].topics = topics;
                thisWatchdog[0].messageString = messageString;
                await thisWatchdog[0].save();
                return { success: true };
            default:
                throw new Error(`Alarm ${name} has ${thisWatchdog.length} buffer info entries, but topic buffer info must be unique.`);
        }
    }

    @Mutation(returns => SuccessBoolean)
    async deleteWatchdog(@Arg("name") name: string) {
        await WatchdogModel.deleteMany({ name }).exec();
        return { success: true };
    }
}