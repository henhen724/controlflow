import { Schema, Document, model, Model, models, Types } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import { QueryMethod } from '@typegoose/typegoose/lib/types';

interface BufferQueries {
    findByTopic: QueryMethod<typeof findByTopic>
}

function findByTopic(this: ReturnModelType<typeof BufferInfo, BufferQueries>, topic: string) {
    return this.findOne({ topic });
}

@modelOptions({ schemaOptions: { collection: 'buffer-info' } })
export class BufferInfo {
    @prop({ required: true, unique: true })
    topic!: string;
    @prop({ required: false })
    experationTime?: number;
    @prop({ required: true })
    expires!: Boolean;
    @prop({ required: false })
    maxSize?: number;
    @prop({ required: true })
    sizeLimited!: Boolean;
    @prop({ required: false })
    maxFreq?: number;
    @prop({ required: true })
    freqLimited!: Boolean;
}

export default models.TopicBuffersInfo as ReturnModelType<typeof BufferInfo, BufferQueries> || getModelForClass(BufferInfo);