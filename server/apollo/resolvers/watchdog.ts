import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx } from "type-graphql";

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

@Resolver()
class WatchdogResolver {
    @Query(returns => [Watchdog])
    async watchdogs() {
        return await WatchdogModel.find({}).exec();
    }

    @Mutation(returns => SuccessBoolean)
    async deleteWatchdog(@Arg("name") name: string) {
        await WatchdogModel.deleteMany({ name }).exec();
        return { success: true };
    }
}