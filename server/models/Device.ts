import { models } from 'mongoose';
import { prop, modelOptions, getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import { URL } from 'url';

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

    @prop({ default: {} })
    deviceSchema!: Object;
}



export default models.Device as ReturnModelType<typeof Device, {}> || getModelForClass(Device);