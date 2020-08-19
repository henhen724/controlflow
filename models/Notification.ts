import { Schema, Document, model, Model, models, Types } from 'mongoose';


export interface INotification extends Document {
    name: String,
    topic: String,
    message: String,
    mqttMessage?: String,
    received: Date,
    viewed: Boolean,
}

const NotificationSchema = new Schema<INotification>({
    name: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    mqttMessage: {
        type: Object,
        required: false,
    },
    recieved: {
        type: Date,
        default: () => new Date(),
    },
    viewed: {
        type: Boolean,
        default: false,
    },
})

export default models.Notification as Model<INotification> || model<INotification>('Notification', NotificationSchema, 'notifications');