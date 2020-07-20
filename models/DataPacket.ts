import { Schema, Document, model, Model, models } from 'mongoose';

// Defining the typescript interfaces which user will use.
export interface IData extends Document {
    experationDate: Number,
    topic: String,
    data: Object
}

const DataSchema = new Schema<IData>({
    experationDate: {
        type: Number,
        default: () => {
            return Date.now() + 5 * 60 * 1000;
        },
        min: 0,
        required: false,
    },
    topic: {
        type: String,
        required: [true, "This data packet must have a topic."],
    },
    data: {
        type: String,
        required: [true, "This data packet has no content/data."],
    },
})

export default models.DataPacket as Model<IData> || model<IData>('DataPacket', DataSchema, 'data');