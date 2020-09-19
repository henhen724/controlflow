import { models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType, queryMethod } from '@typegoose/typegoose';
import { QueryMethod } from '@typegoose/typegoose/lib/types';
import { UnionPanelSettings } from '../../components/Panel/index';
import crypto from 'crypto';
import { sign } from 'jsonwebtoken';

// Defining the typescript interfaces which user will use.

export interface session {
    id: string;
    email: string;
    exp: number;
}

export const sessionExpTime = 1000 * 60 * 60 * 8;

@modelOptions({ schemaOptions: { collection: 'users' } })
export class User {
    _id!: string // Added to avoid type errors in internal methods
    @prop({ required: true, unique: true, index: true, match: /\S+@\S+\.\S+/, lowercase: true })
    public email!: string;
    @prop({ required: true })
    public dashboardProps!: UnionPanelSettings[];
    @prop({ required: true })
    private hash?: string;
    @prop({ required: true })
    private salt?: string;
    public get password() {
        throw new Error("You cannot view user passwords as they are hashed.");
    }
    public set password(password: string) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto
            .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
            .toString('hex')
    }
    public validatePassword(password: string): boolean {
        if (!this.salt || !this.hash) throw new Error("Cannot validate password before before password is set.");
        return this.hash === crypto
            .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
            .toString('hex');
    }
    public generateJWT() {
        if (!process.env.TOKEN_SECRET) throw new Error("Server token secret is not intialized.");
        return sign({
            id: this._id,
            email: this.email,
            exp: Date.now() + sessionExpTime
        } as session, process.env.TOKEN_SECRET);
    }
}

export default models.User as ReturnModelType<typeof User, {}> || getModelForClass(User);