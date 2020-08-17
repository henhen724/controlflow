import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../../models/User';
import TopicBufferInfo from '../../models/TopicBufferInfo';
import DataPacket from '../../models/DataPacket';
import Alarm from '../../models/Alarm';
import findBufferSize from '../../lib/findBufferSize';

const notSignedIn = (route: string) => new AuthenticationError(`You need to be signed in to query ${route}`);

interface BufferFullInfo {
    experationTime?: number,
    expires: Boolean,
    maxSize?: number,
    sizeLimited: Boolean,
    topic: string,
    currSize?: number,
}

const Query = {
    async user(id: string) {
        return await User.find({ id: id }).exec();
    },
    async userByName(_: any, args: { email: string }, context: any) {
        const { email } = args;
        const session = await context.session;
        if (session) {
            return await User.find({ email: email }).exec();
        }
        throw notSignedIn("userByName");
    },
    async users(_: any, args: {}, context: any) {
        const session = await context.session;
        if (session) {
            const users = await User.find({}).exec();
            return users;
        }
        throw notSignedIn("users");
    },
    async viewer(parent: any, args: any, context: any, info: any) {
        const session = await context.session
        if (session) {
            return await User.findOne({ id: session.id }).exec();
        }
        return // We don't throw error here because this route is used to check wether the user is signed in.
    },
    async runningBuffers(_: any, args: any, context: any) {
        const session = await context.session
        if (session) {
            const buffers = await TopicBufferInfo.find({}).exec();
            const bufferMoreInfo = [] as BufferFullInfo[];
            for (var i = 0; i < buffers.length; i++) {
                const buffer = buffers[i] as BufferFullInfo;
                buffer.currSize = (await findBufferSize(buffer.topic)).total_size;
                bufferMoreInfo.push(buffer);
            }
            return bufferMoreInfo;
        }
        throw notSignedIn("runningBuffers");
    },
    async alarms(_: any, args: any, context: any) {
        // const session = await context.session
        // if (session) {
        const buffers = await Alarm.find({}).exec();
        console.log(buffers);
        return buffers;
        // }
        // throw notSignedIn("alarms");
    },
    async topicBuffer(_: any, args: { topic: string }) {
        return await DataPacket.find({ topic: args.topic }).exec();
    }
}

export default Query;