"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const User_1 = __importDefault(require("../models/User"));
const user_1 = require("../lib/user");
const auth_1 = require("../lib/auth");
const auth_cookies_1 = require("../lib/auth-cookies");
const graphql_1 = require("graphql");
const mqtt_1 = require("mqtt");
const graphql_mqtt_subscriptions_1 = require("graphql-mqtt-subscriptions");
const client = mqtt_1.connect('mqtt://broker.shiftr.io:1883', { username: process.env.SHIFTER_USERNAME, password: process.env.SHIFTER_PASSWORD, reconnectPeriod: 1000 });
const mqttPubSub = new graphql_mqtt_subscriptions_1.MQTTPubSub({ client: client });
;
exports.resolvers = {
    Date: new graphql_1.GraphQLScalarType({
        name: 'Date',
        description: 'The standard Date type for javascript.',
        parseValue(value) {
            return new Date(value);
        },
        serialize(value) {
            return value.getTime();
        },
    }),
    Subscriptions: {
        mqttTopics: {
            subscribe: async (_, args, context) => {
                const session = await context.session;
                if (session) {
                    return mqttPubSub.asyncIterator(args.topics);
                }
                else {
                    throw new apollo_server_express_1.AuthenticationError(`Sorry, but you have to be signed into subscribe to MQTT data.`);
                }
            }
        },
    },
    Query: {
        async user(id) {
            return await User_1.default.find({ id: id }).exec();
        },
        async userByName(email) {
            return await User_1.default.find({ email: email }).exec();
        },
        async users() {
            const users = await User_1.default.find({}).exec();
            return users;
        },
        async viewer(parent, args, context, info) {
            const session = await context.session;
            if (session) {
                return await User_1.default.findOne({ id: session.id }).exec();
            }
            return;
        },
    },
    Mutation: {
        async signUp(parent, args, context, info) {
            const user = await user_1.createUser(args.input);
            const nameConflict = await User_1.default.find({ name: user.email });
            if (nameConflict.length !== 0)
                throw new apollo_server_express_1.UserInputError(`An account already exists for ${user.email}.`, { type: 'USER_EXISTS' });
            await User_1.default.create(user);
            return { user };
        },
        async signIn(parent, args, context, info) {
            console.log("sign started");
            const { email, password } = args.input;
            const user = await User_1.default.find({ email }).exec(); // Find returns an array here I check that there is exactly one match
            if (user.length === 0)
                throw new apollo_server_express_1.UserInputError(`There is no users with the email ${email}`, { type: 'USER_DOES_NOT_EXIST' });
            if (user.length > 1) {
                console.log(`There are some how ${user.length} users with the email ${email}.  Here they are:\n${user}`);
                throw new Error(`Internal server error, some how multiple people have the email ${email}.`);
            }
            if (await user_1.validatePassword(user[0], password)) {
                const session = { id: user[0].id, email: user[0].email };
                await auth_1.setLoginSession(context.res, session);
                return { user: user[0] };
            }
            else
                throw new apollo_server_express_1.AuthenticationError('Sorry, that password isn\'t correct.');
        },
        async signOut(parent, args, context, info) {
            auth_cookies_1.removeTokenCookie(context.res);
            return true;
        },
    },
};
