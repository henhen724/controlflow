import { Schema, Document, model, Model, models, Types } from 'mongoose';

// Defining the typescript interfaces which user will use.
export interface ITopic extends Document {
    experationTime?: number,
    expires: Boolean,
    maxSize?: number,
    sizeLimited: Boolean,
    topic: string,
}

const TopicBuffersInfo = new Schema<ITopic>({
    experationTime: {
        type: Number,
        required: false
    },
    expires: {
        type: Boolean,
        required: true,
    },
    maxSize: { // In Bytes
        type: Number,
        required: false
    },
    sizeLimited: {
        type: Boolean,
        required: true
    },
    topic: {
        type: String,
        required: [true, "Topic string missing from topic object."],
        unique: [true, "This topic all ready has an info object"],
    }
}, { strict: true })

export default models.TopicBuffersInfo as Model<ITopic> || model<ITopic>('TopicBuffersInfo', TopicBuffersInfo, 'buffer-info');