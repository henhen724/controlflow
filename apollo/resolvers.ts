import { AuthenticationError, UserInputError } from 'apollo-server-micro';
import { PubSub } from 'apollo-server';
import User from '../models/User';
import { createUser, validatePassword } from '../lib/user';
import { setLoginSession, getLoginSession } from '../lib/auth';
import { removeTokenCookie } from '../lib/auth-cookies';
import fetch from 'isomorphic-unfetch';
import { GraphQLScalarType } from 'graphql';

const pubsub = new PubSub();

export const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'The standard Date type for javascript',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
  }),
  Subscriptions: {
    dataRecieved: {
      subscribe: () => pubsub.asyncIterator([]),
    },
  },
  Query: {
    async user(id) {
      return await User.find({ id: id }).exec();
    },
    async userByName(email) {
      return await User.find({ email: email }).exec();
    },
    async users() {
      const users = await User.find({}).exec();
      return users;
    },
    async viewer(parent, args, context, info) {
      var session = null;
      try {
        session = await getLoginSession(context.req);
      } catch (err) {
        if (err.message === 'Bad hmac value') {
          removeTokenCookie(context.res);
          throw new UserInputError("Cookie was corupted.  Please reload the page.");
        }
        throw err;
      }

      if (session) {
        return await User.findOne({ id: session.id }).exec();
      }
    },
  },
  Mutation: {
    async signUp(parent, args, context, info) {
      const user = await createUser(args.input);
      const nameConflict = await User.find({ name: user.name });
      if (nameConflict.length !== 0)
        throw new UserInputError(`An account already exists for ${user.name}.`, { type: 'USER_EXISTS' });
      await User.create(user);
      return { user };
    },
    async signIn(parent, args, context, info) {
      const { email, password } = args.input;
      const user = await User.find({ email }).exec(); // Find returns an array here I check that there is exactly one match
      if (user.length === 0)
        throw new UserInputError(`There is no users with the email ${email}`, { type: 'USER_DOES_NOT_EXIST' });
      if (user.length > 1) {
        console.log(`There are some how ${user.length} users with the email ${email}.  Here they are:\n${user}`);
        throw new Error(`Internal server error, some how multiple people have the email ${user.email}.`);
      }
      if (await validatePassword(user[0], password)) {
        const session = { id: user[0].id, email: user[0].email }

        await setLoginSession(context.res, session);

        return { user: user[0] };
      }
      else
        throw new AuthenticationError('Sorry, that password isn\'t correct.');
    },
    async signOut(parent, args, context, info) {
      removeTokenCookie(context.res);
      return true
    },
  },
}
