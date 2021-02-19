import { Schema, Document, model, Model, models, Types } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';


@modelOptions({ schemaOptions: { collection: 'buffer-info' } })
export class DBTopicInfo {
    @prop({ required: true, unique: true })
    topic!: string;
    @prop({ default: true, required: true })
    recordArchive!: Boolean;
    @prop({ default: true, required: true })
    recordRollingBuffer!: Boolean;
    @prop({ required: true, default: false })
    freqLimited!: Boolean;
    @prop({ required: false })
    maxFreq?: number;

    //Rolling buffer info

    @prop({ required: true, default: false })
    expires!: boolean;
    @prop({ required: false })
    experationTime?: number;
    @prop({ required: true, default: true })
    sizeLimited!: boolean;
    @prop({ required: false, default: 2000 }) // If not spesified, set a 2KB size limit on the rolling buffer.
    maxSize?: number;
}


export default models.TopicBuffersInfo as ReturnModelType<typeof DBTopicInfo, {}> || getModelForClass(DBTopicInfo);