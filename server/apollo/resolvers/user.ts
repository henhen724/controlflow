import "reflect-metadata";
import { ObjectType, ArgsType, Arg, Args, Resolver, Query, Mutation, Field, ID, Int, Ctx } from "type-graphql";
import { AuthenticationError, UserInputError } from 'apollo-server-express';

import SuccessBoolean from "../types/SuccessBoolean";

import UserModel from '../../models/User';
import { setSession, deleteSession } from '../../lib/auth';

@ObjectType({ description: "A team member" })
class User {
    @Field(type => ID)
    _id: string;
    @Field()
    email: string;
}

@ArgsType()
class SignInOrUp {
    @Field()
    email: string;
    @Field()
    password: string;
}

@Resolver()
class UserResolver {
    @Query(returns => User)
    async user(@Arg("id") id: string) {
        return await UserModel.findById(id).exec();
    }
    @Query(returns => User)
    async userByEmail(@Arg("email") email: string) {
        return await UserModel.find({ email }).exec();
    }
    @Query(returns => User)
    async users() {
        return await UserModel.find({}).exec();
    }
    @Query(returns => User, { nullable: true })
    async viewer(@Ctx() ctx: any) {
        if (ctx.session) {
            return await UserModel.findById(ctx.session.id).exec();
        }
        return // We don't throw error here because this route is used to check wether the user is signed in.
    }

    @Mutation(returns => User)
    async signUp(@Args() input: SignInOrUp): Promise<User> {
        const nameConflict = await UserModel.find({ email: input.email });
        if (nameConflict.length !== 0)
            throw new UserInputError(`An account already exists for ${input.email}.`, { type: 'USER_EXISTS' });
        const user = new UserModel(input);
        await user.save((err: any) => {
            if (err) throw new UserInputError(err);
        });
        return user;
    }
    @Mutation(returns => User)
    async signIn(@Args() input: SignInOrUp, @Ctx() ctx: any): Promise<User> {
        const { email, password } = input;
        console.log(`Sign in from ${email}`);
        const user = await UserModel.find({ email }).exec(); // Find returns an array here I check that there is exactly one match
        if (user.length === 0)
            throw new UserInputError(`There is no users with the email ${email}`, { type: 'USER_DOES_NOT_EXIST' });
        if (user.length > 1) {
            console.error(`There are some how ${user.length} users with the email ${email}.  Here they are:\n${user}`);
            throw new Error(`Internal server error, some how multiple people have the email ${email}.`);
        }
        if (user[0].validatePassword(password)) {
            await setSession(ctx.res, user[0]);

            return user[0];
        }
        else
            throw new AuthenticationError('Sorry, that password isn\'t correct.');
    }
    @Mutation(returns => SuccessBoolean)
    async signOut(@Ctx() ctx: any) {
        deleteSession(ctx.res);
        return { success: true };
    }
}

export default UserResolver;