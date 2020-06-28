import { AuthenticationError, UserInputError } from 'apollo-server-express';
import User from '../models/User';
import { createUser, validatePassword } from '../lib/user';
import { setLoginSession } from '../lib/auth';
import { removeTokenCookie } from '../lib/auth-cookies';
import fetch from 'isomorphic-unfetch';
import { GraphQLScalarType } from 'graphql';
import { connect } from 'mqtt';
import { MQTTPubSub } from 'graphql-mqtt-subscriptions';

const client = connect('mqtt://broker.shiftr.io:1883', { username: process.env.SHIFTER_USERNAME, password: process.env.SHIFTER_PASSWORD, reconnectPeriod: 1000 });
const mqttPubSub = new MQTTPubSub({ client: client });

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

export const resolvers = {
  Date: new GraphQLScalarType({
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
      subscribe: async (_: any, args: { topics: [string] }, context: any) => {
        const session = await context.session;
        if (session) {
          return mqttPubSub.asyncIterator(args.topics);
        } else {
          throw new AuthenticationError(`Sorry, but you have to be signed into subscribe to MQTT data.`);
        }
      }
    },
  },
  Query: {
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
      const session = await context.session
      if (session) {
        return await User.findOne({ id: session.id }).exec();
      }
      return
    },
  },
  Mutation: {
    async signUp(parent: any, args: SignUpInput, context: any, info: any) {
      const user = await createUser(args.input);
      const nameConflict = await User.find({ name: user.email });
      if (nameConflict.length !== 0)
        throw new UserInputError(`An account already exists for ${user.email}.`, { type: 'USER_EXISTS' });
      await User.create(user);
      return { user };
    },
    async signIn(parent: any, args: SignInInput, context: any, info: any) {
      const { email, password } = args.input;
      const user = await User.find({ email }).exec(); // Find returns an array here I check that there is exactly one match
      if (user.length === 0)
        throw new UserInputError(`There is no users with the email ${email}`, { type: 'USER_DOES_NOT_EXIST' });
      if (user.length > 1) {
        console.log(`There are some how ${user.length} users with the email ${email}.  Here they are:\n${user}`);
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
  },
}
