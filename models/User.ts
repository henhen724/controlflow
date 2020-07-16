import { Schema, Document, model, Types, models } from 'mongoose';
import { PanelProps } from '../components/dashboard';

// Defining the typescript interfaces which user will use.

export interface IUser extends Document {
    id: string,
    hash: string,
    salt: string,
    email: string,
    dashboardProps: PanelProps,
}

const UserSchema = new Schema({
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
})

export default models.User || model<IUser>('User', UserSchema, 'users');