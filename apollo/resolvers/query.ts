import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../../models/User';
import TopicBufferInfo from '../../models/TopicBufferInfo';

const Query = {
    async user(id: string) {
        return await User.find({ id: id }).exec();
    },
    async userByName(email: string) {
        return await User.find({ email: email }).exec();
    },
    async users() {
        const users = await User.find({}).exec();
        return users;
    },
    async viewer(parent: any, args: any, context: any, info: any) {
        console.log("Viewer query started.")
        const session = await context.session
        if (session) {
            console.log("viewer found.");
            return await User.findOne({ id: session.id }).exec();
        }
        return
    },
    async runningBuffers() {
        return await TopicBufferInfo.find({}).exec();
    }
}

export default Query;