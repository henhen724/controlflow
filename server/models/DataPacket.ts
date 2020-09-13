import { models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'data' } })
class DataPacket {
    @prop({ default: Date.now, required: true })
    public created!: Date;
    @prop({ required: true })
    public topic!: String;
    @prop({ required: true })
    public data!: Object;
}

export default models.DataPacket as ReturnModelType<typeof DataPacket, {}> || getModelForClass(DataPacket);