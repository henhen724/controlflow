import { AuthenticationError, UserInputError } from 'apollo-server-micro';
import User from '../models/User';
import { createUser, validatePassword } from '../lib/user';
import { setLoginSession, getLoginSession } from '../lib/auth';
import { removeTokenCookie } from '../lib/auth-cookies';
import fetch from 'isomorphic-unfetch';
import { GraphQLScalarType } from 'graphql';

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
  Query: {
    async user(id) {
      return await User.find({ id: id }).exec();
    },
    async userByName(name) {
      return await User.find({ name: name }).exec();
    },
    async users() {
      return await User.find({}).exec();
    },
    async viewer(parent, args, context, info) {
      const session = await getLoginSession(context.req);

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
      const { name, password } = args.input;
      const user = await User.find({ name }).exec(); // Find returns an array here I check that there is exactly one match
      if (user.length === 0)
        throw new UserInputError(`There is no users with the name ${name}`, { type: 'USER_DOES_NOT_EXIST' });
      if (user.length > 1) {
        console.log(`There are some how ${user.length} users with the name ${name}.  Here they are:\n${user}`);
        throw new Error(`Internal server error, some how multiple people have the name ${user.name}.`);
      }
      if (await validatePassword(user[0], password)) {
        const session = { id: user[0].id, name: user[0].name }

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
