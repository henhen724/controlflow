import { Schema, Document, model, Model, Types, models } from 'mongoose';

// Defining the typescript interfaces which user will use.


export interface IWatchdog extends Document {
    name: string,
    topics: string[],
    messageString: string,
}

const WatchdogSchema = new Schema<IWatchdog>({
    name: {
        type: String,
        required: true,
    },
    topics: {
        type: [String],
        required: true,
    },
    messageString: {
        type: String,
        required: true,
    }
}, { strict: true })

export default models.Watchdog as Model<IWatchdog> || model<IWatchdog>('Watchdog', WatchdogSchema, 'alarms');