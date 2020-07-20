import { Schema, Document, model, Model, models, Types } from 'mongoose';

// Defining the typescript interfaces which user will use.
export interface ITopic extends Document {
    experationTime: number,
    topic: string,
}

const TopicBuffersInfo = new Schema<ITopic>({
    experationTime: {
        type: Types.Decimal128,
        required: [true, "This topic needs an experation time."]
    },
    topic: {
        type: String,
        required: [true, "Topic string missing from topic object."],
        unique: [true, "This topic all ready has an info object"],
    }
}, { strict: true })

export default models.TopicBuffersInfo as Model<ITopic> || model<ITopic>('TopicBuffersInfo', TopicBuffersInfo, 'buffer-info');