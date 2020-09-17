import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../../models/User';
import TopicBufferInfo from '../../models/TopicBufferInfo';
import DataPacket from '../../models/DataPacket';
import Watchdog from '../../models/Watchdog';
import Notification from '../../models/Notification';
import Device from '../../models/Device';
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
    async userByName(_: any, args: { email: string }, ctx: any) {
        const { email } = args;
        const session = await ctx.session;
        if (session) {
            return await User.find({ email: email }).exec();
        }
        throw notSignedIn("userByName");
    },
    async users(_: any, args: {}, ctx: any) {
        const session = await ctx.session;
        if (session) {
            const users = await User.find({}).exec();
            return users;
        }
        throw notSignedIn("users");
    },
    async viewer(_: any, args: any, ctx: any, info: any) {
        if (ctx.session) {
            return await User.findById(ctx.session.id).exec();
        }
        return // We don't throw error here because this route is used to check wether the user is signed in.
    },
    async runningBuffers(_: any, args: any, ctx: any) {
        const session = await ctx.session
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
    async watchdogs(_: any, args: any, ctx: any) {
        return await Watchdog.find({}).exec();
    },
    async topicBuffer(_: any, args: { topic: string }) {
        return await DataPacket.find({ topic: args.topic }).exec();
    },
    async notifications() {
        const notos = (await Notification.find({}).sort({ "received": "desc" }).exec());
        // console.log(notos);
        return notos
    },
    async notificationById(_: any, args: { id: string }) {
        const notos = await Notification.findById(args.id).exec();
        return notos;
    },
    async devices() {
        return await Device.find({}).exec();
    },
    async deviceByIp(_: any, args: { ip: string }) {
        const device = await Device.findOne({ ip: args.ip }).exec();
        return device;
    }
}

export default Query;