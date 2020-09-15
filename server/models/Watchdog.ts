import { Schema, Document, model, Model, Types, models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';


@modelOptions({ schemaOptions: { collection: 'alarms' } })
export class Watchdog {
    @prop({ required: true })
    name!: string;
    @prop({ required: true })
    topics!: string[];
    @prop({ required: true })
    messageString!: string;
}

export default models.Watchdog as ReturnModelType<typeof Watchdog, {}> || getModelForClass(Watchdog);