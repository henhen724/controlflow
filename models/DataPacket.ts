import { Schema, Document, model, models } from 'mongoose';

// Defining the typescript interfaces which user will use.
export interface IData extends Document {
    experationDate: Date,
    topic: string,
    type: JSON
}

const DataSchema = new Schema({
    experationDate: {
        type: Date,
        required: false
    },
    topic: {
        type: String,
        required: [true, "This data packet must have a topic."],
    },
    data: {
        type: JSON,
        required: [true, "This data packet has no content/data."],
    },
})

export default models.DataPacket || model<IData>('DataPacket', DataSchema, 'data');