import { Schema, Document, model, Model, Types, models } from 'mongoose';
import { PanelProps } from '../../components/livedata';

// Defining the typescript interfaces which user will use.

export interface IUser extends Document {
    id: string,
    hash: string,
    salt: string,
    email: string,
    dashboardProps: PanelProps,
}

const UserSchema = new Schema<IUser>({
    id: {
        type: Types.ObjectId,
        required: [true, 'This user needs an object id.']
    },
    hash: {
        type: String,
        required: [true, 'User needs a password hash.']
    },
    salt: {
        type: String,
        required: [true, 'User needs a salt for password encryption.']
    },
    created: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: [true, 'This user needs a email.'],
        unique: [true, 'This email is already linked to this account.'],
    },
    dashboardProps: [{
        topic: {
            type: String,
            required: [true, 'This panel element needs a topic.']
        },
        elemType: {
            type: String,
            required: [true, 'This panel needs an element type.']
        },
        displayType: {
            type: String,
            required: [true, 'This panel needs a display type.']
        },
        displayProps: {
            type: Object,
            required: false,
        }
    }]
}, { strict: true })

export default models.User as Model<IUser> || model<IUser>('User', UserSchema, 'users');