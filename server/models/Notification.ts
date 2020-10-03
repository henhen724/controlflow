import { models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'notifications' } })
export class Notification {
    _id?: string;
    @prop({ required: true })
    name!: string;
    @prop({ required: true })
    topic!: string;
    @prop({ required: true })
    message!: string;
    @prop({ required: true })
    mqttMessage!: string;
    @prop({ default: Date.now })
    received?: Date;
    @prop({ default: false })
    viewed?: boolean;
}

export default models.Notification as ReturnModelType<typeof Notification, {}> || getModelForClass(Notification);