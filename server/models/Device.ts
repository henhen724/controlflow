import { models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'devices' } })
class Device {
    @prop({ default: () => new Date(), required: true })
    created!: Date;
    @prop({
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: (v: string) => /(\d{1,3}\.){3}\d{1,3}/.test(v),
            message: (props: any) => `${props.value} is not a valid IPv4 address.`
        }
    })
    ip!: string;
    @prop({ required: true, min: 0, max: 65535 })
    port!: number;
    public get uri() {
        return `http://${this.ip}:${this.port}`;
    }
    @prop({ default: {} })
    deviceSchema!: Object;
}



export default models.Device as ReturnModelType<typeof Device, {}> || getModelForClass(Device);