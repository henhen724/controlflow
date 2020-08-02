import { Schema, Document, model, Model, Types, models } from 'mongoose';

// Defining the typescript interfaces which user will use.


export interface IAlarm extends Document {
    name: string,
    topics: [{ topic: string }],
    triggerFunction: string,
    actionFunction: string,
}

const AlarmSchema = new Schema<IAlarm>({
    name: {
        type: String,
        required: true,
    },
    topics: [{
        topic: {
            type: [String],
            required: true,
        },
    }],
    triggerFunction: {
        type: String,
        required: true,
    },
    actionFunction: {
        type: String,
        required: true,
    },
}, { strict: true })

export default models.User as Model<IAlarm> || model<IAlarm>('Alarm', AlarmSchema, 'alarms');