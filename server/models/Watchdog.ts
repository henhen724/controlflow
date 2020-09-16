import { models, Schema } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';


@modelOptions({ schemaOptions: { collection: 'alarms' } })
export class Watchdog {
    @prop({ required: true })
    name!: string;
    @prop({ required: true, type: Schema.Types.Mixed })
    topics!: string[];
    @prop({ required: true })
    messageString!: string;
}

export default models.Watchdog as ReturnModelType<typeof Watchdog, {}> || getModelForClass(Watchdog);