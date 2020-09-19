import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Resolver, Query, Mutation, Subscription, Field, ID, Int, Ctx, Args, PubSub, PubSubEngine, Root } from "type-graphql";
import { GraphQLTimestamp } from "graphql-scalars";

import NotificationModel from "../../models/Notification";
import SuccessBoolean from "../types/SuccessBoolean";
import { UserInputError } from 'apollo-server';

@ObjectType()
class Notification {
    @Field(type => ID)
    _id: string;
    @Field()
    name: string;
    @Field()
    topic: string;
    @Field()
    message: string;
    @Field()
    mqttMessage: string;
    @Field(type => GraphQLTimestamp)
    received: Date;
    @Field()
    viewed: boolean;
}

@ArgsType()
class CreateNotificationInput {
    @Field()
    name: string;
    @Field()
    topic: string;
    @Field()
    message: string;
    @Field()
    mqttMessage: string;
}

@Resolver()
class NotificationResolver {
    @Query(returns => [Notification])
    async notifications() {
        return (await NotificationModel.find({}).sort({ "received": "desc" }).exec());
    }
    @Query(returns => Notification)
    async notificationById(@Arg("id") id: string) {
        return await NotificationModel.findById(id).exec();
    }


    @Mutation(returns => SuccessBoolean)
    async viewNotification(@Arg("id") id: string) {
        const notification = await NotificationModel.findById(id);
        if (notification) {
            notification.viewed = true;
            await notification.save();
            return { success: true };
        } else {
            return { success: false, message: "No such notification." }
        }
    }
    @Mutation(returns => Notification)
    async createNotification(@Args() input: CreateNotificationInput, @PubSub() pubSub: PubSubEngine) {
        const newNoto = new NotificationModel(input);
        await pubSub.publish("CREATE", newNoto);
        await newNoto.save((err, noto) => {
            if (err) throw new UserInputError(err);
        });
        return newNoto;
    }
    @Mutation(returns => SuccessBoolean)
    async deleteNotification(@Arg("id") id: string, @PubSub() pubSub: PubSubEngine) {
        await pubSub.publish("DELETE", id);
        await NotificationModel.findByIdAndDelete(id);
        return { success: true };
    }


    @Subscription(returns => Notification, { topics: "CREATE" })
    watchCreatedNotifications(@Root() notification: Notification): Notification {
        return notification;
    }
    @Subscription(returns => String, { topics: "DELETE" })
    watchDeletedNotifications(@Root() id: string): string {
        return id;
    }
}

export default NotificationResolver;