import { models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import { URL } from 'url';
import { JSONSchema7 } from 'json-schema';

export interface deviceSchema {
    in: {
        [key: string]: JSONSchema7;
    }
    out: {
        [key: string]: JSONSchema7;
    }
}

@modelOptions({ schemaOptions: { collection: 'devices' } })
class Device {
    @prop({ default: Date.now, required: true })
    created!: Date;


    @prop({ required: true, unique: true, index: true, match: /(\d{1,3}\.){3}\d{1,3}/ })
    ip!: string;
    @prop({ required: true, min: 0, max: 65535 })
    port!: number;
    @prop({ required: true })
    secure!: boolean;
    public get uri() {
        if (this.secure) {
            return `https://${this.ip}:${this.port}`;
        } else {
            return `http://${this.ip}:${this.port}`;
        }
    }
    public set uri(fullURL) {
        const newURL = new URL(fullURL);
        if (!/(\d{1,3}\.){3}\d{1,3}/.test(newURL.hostname)) throw new Error(`Device URL must have an IPv4 address as its hostname not ${newURL.hostname}`);
        const port = parseInt(newURL.port);
        if (isNaN(port)) throw new Error(`Device URL must have an explicit port.`);
        this.ip = newURL.hostname;
        this.port = port;
        this.secure = newURL.protocol === 'https:';
    }

    @prop({ required: true })
    name!: string;
    @prop({ required: true, enum: ['aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', 'win32'] })
    platform!: string;
    @prop({ required: true })
    osName!: string;

    @prop({ default: {} })
    deviceSchema!: deviceSchema;

    @prop({ default: false })
    connected!: boolean
}



export default models.Device as ReturnModelType<typeof Device, {}> || getModelForClass(Device);