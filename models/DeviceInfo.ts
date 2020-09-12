import { Schema, Document, model, Model, models, Types } from 'mongoose';

export interface IDeviceInfo extends Document {
    created: Date,
    ip: string,
    deviceSchema: Object,
}

const DeviceInfoSchema = new Schema<IDeviceInfo>({
    created: {
        type: Date,
        default: () => new Date(),
        required: true
    },
    ip: {
        type: String,
        required: [true, "Need an IP for all connected devices."],
        validate: {
            validator: (v: string) => /(\d{1,3}\.){3}\d{1,3}/.test(v),
            message: props => `${props.value} is not a valid IPv4 address.`
        },
        unique: true,
        index: true
    },
    deviceSchema: {
        type: Object,
        default: {},
        required: true
    }
})

export default models.DeviceInfo as Model<IDeviceInfo> || model<IDeviceInfo>('DeviceInfo', DeviceInfoSchema, 'devices');