import mongoose from 'mongoose';

// Defining the typescript interfaces which user will use.

interface User {
    id: string,
    hash: string,
    salt: string,
    name: string,
}

const UserSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.ObjectId,
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
        required: [true, 'This user needs a name.']
    },
})

export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');