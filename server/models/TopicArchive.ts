import { Schema, Document, model, Model, models, Types } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';


@modelOptions({ schemaOptions: { collection: 'archive-info' } })
export class TopicArchive {
    @prop({ required: true, unique: true })
    topic!: string;
    @prop({ required: true, default: true })
    recording!: boolean
}

export default models.TopicBuffersInfo as ReturnModelType<typeof TopicArchive, {}> || getModelForClass(TopicArchive);