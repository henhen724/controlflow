import { Schema, Document, model, Model, models, Types } from 'mongoose';


export interface IData extends Document {
    created: Date,
    experationDate?: Date,
    expires: Boolean,
    topic: String,
    data: Object
}

const DataSchema = new Schema<IData>({
    created: {
        type: Date,
        default: () => {
            return new Date();
        },
        required: [true, "I need to know when this packet was created."],
    },
    topic: {
        type: String,
        required: [true, "This data packet must have a topic."],
    },
    data: {
        type: Object,
        required: [true, "This data packet has no content/data."],
    },
})

export default models.DataPacket as Model<IData> || model<IData>('DataPacket', DataSchema, 'data');