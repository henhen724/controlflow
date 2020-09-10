import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../../models/User';
import TopicBufferInfo from '../../models/TopicBufferInfo';
import DataPacket from '../../models/DataPacket';
import Watchdog, { IWatchdog } from '../../models/Watchdog';
import Notification from '../../models/Notification';
import { createUser, validatePassword } from '../../lib/user';
import { setLoginSession } from '../../lib/auth';
import { removeTokenCookie } from '../../lib/auth-cookies';
import fetch from 'isomorphic-unfetch'; //For when I add OAuth back in
import { mqttPubSub } from "./subscription";

export interface SignUpInput {
    input: {
        email: string;
        password: string;
    }
};

export interface SignInInput {
    input: {
        email: string;
        password: string;
    }
}

export interface mqttPublishInput {
    input: {
        topic: string,
        payload: {
            SOLO_STRING: string | undefined,
            [key: string]: any
        }
    }
}

export interface recordTopicInput {
    input: {
        topic: string,
        experationTime: number,
        expires: Boolean,
        maxSize: number,
        sizeLimited: Boolean,
    }
}

export interface setWatchdogInput {
    input: IWatchdog
}

const Mutation = {
    async signUp(parent: any, args: SignUpInput, context: any, info: any) {
        const user = await createUser(args.input);
        const nameConflict = await User.find({ name: user.email });
        if (nameConflict.length !== 0)
            throw new UserInputError(`An account already exists for ${user.email}.`, { type: 'USER_EXISTS' });
        await new User(user);
        return { user };
    },
    async signIn(parent: any, args: SignInInput, context: any, info: any) {
        const { email, password } = args.input;
        const user = await User.find({ email }).exec(); // Find returns an array here I check that there is exactly one match
        if (user.length === 0)
            throw new UserInputError(`There is no users with the email ${email}`, { type: 'USER_DOES_NOT_EXIST' });
        if (user.length > 1) {
            console.error(`There are some how ${user.length} users with the email ${email}.  Here they are:\n${user}`);
            throw new Error(`Internal server error, some how multiple people have the email ${email}.`);
        }
        if (await validatePassword(user[0], password)) {
            const session = { id: user[0].id, email: user[0].email }

            await setLoginSession(context.res, session);

            return { user: user[0] };
        }
        else
            throw new AuthenticationError('Sorry, that password isn\'t correct.');
    },
    async signOut(parent: any, args: any, context: any, info: any) {
        removeTokenCookie(context.res);
        return true
    },
    async mqttPublish(_: any, args: mqttPublishInput, context: any) {
        const { topic, payload } = args.input;
        if (payload && payload.SOLO_STRING) {
            return { success: mqttPubSub.publish(topic, payload.SOLO_STRING) };
        } else {
            return { success: mqttPubSub.publish(topic, payload) };
        }
    },
    async recordTopic(_: any, args: recordTopicInput, context: any) {
        console.log(`Starting topic record for ${args.input.topic}\n%j`, args.input);
        const { topic, experationTime, maxSize } = args.input;
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

    },
    async deleteTopicBuffer(_: any, args: { topic: string }, context: any) {
        console.log(`Deleteing ${args.topic}`);
        await TopicBufferInfo.deleteMany({ topic: args.topic }).exec();
        await DataPacket.deleteMany({ topic: args.topic }).exec();
        return { success: true };
    },
    async setWatchdog(_: any, args: setWatchdogInput, context: any) {
        console.log(`Starting topic record for ${args.input.name}\n%j`, args.input);
        const { name, topics, messageString } = args.input;
        const watchdogs = await Watchdog.find({ name });
        switch (watchdogs.length) {
            case 0:
                const newWatchdog = new Watchdog({
                    name,
                    topics,
                    messageString,
                })
                await newWatchdog.save();
                return { success: true };
            case 1:
                watchdogs[0].topics = topics;
                watchdogs[0].messageString = messageString;
                await watchdogs[0].save();
                return { success: true };
            default:
                throw new Error(`Topic ${name} has ${watchdogs.length} buffer info entries, but topic buffer info must be unique.`);
        }
    },
    async deleteWatchdog(_: any, args: { name: string }, context: any) {
        console.log(`Deleteing ${args.name}`);
        await Watchdog.deleteMany({ name: args.name }).exec();
        return { success: true };
    },
    async viewNotification(_: any, args: { id: string }) {
        const notification = await Notification.findById(args.id);
        if (notification) {
            notification.viewed = true;
            await notification.save();
            return { success: true };
        } else {
            return { success: false, message: "No such notification." }
        }
    },
    async deleteNotification(_: any, args: { id: string }) {
        await Notification.findByIdAndDelete(args.id);
        return { success: true };
    }
}

export default Mutation;