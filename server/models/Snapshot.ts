import { models, Schema } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType, Ref } from '@typegoose/typegoose';
import { DataPacket } from './DataPacket';

@modelOptions({ schemaOptions: { collection: 'snapshots' } })
class Snapshot {
    @prop({ default: Date.now, required: true })
    public created!: Date;
    @prop({ required: true })
    public settings: Ref<DataPacket>[];
    @prop({ required: true })
    public readings: Ref<DataPacket>[];
}

export default models.Snapshot as ReturnModelType<typeof Snapshot, {}> || getModelForClass(Snapshot);