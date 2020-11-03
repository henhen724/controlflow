import { models, Schema } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'data-archive' } })
export class ArchiveDataPacket {
    @prop({ default: Date.now, required: true })
    public created!: Date;
    @prop({ required: true })
    public topic!: String;
    @prop({ required: true })
    public data!: Object;
}

export default models.ArchiveDataPacket as ReturnModelType<typeof ArchiveDataPacket, {}> || getModelForClass(ArchiveDataPacket);