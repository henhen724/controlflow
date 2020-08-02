import { calculateObjectSize } from 'bson';
import dbConnect from './dbConnect';
import DataPacket from '../models/DataPacket';

const findBufferSize = async (topic: string) => {
    dbConnect();

    const numOfPackets = await DataPacket.count({ topic });
    const examplePacket = await DataPacket.findOne({ topic });
    var packetSize = 1000;
    if (examplePacket) {
        examplePacket.toJSON()
        packetSize = calculateObjectSize(examplePacket);
    }

    const total_size = numOfPackets * packetSize;
    return { total_size, packetSize };
}

export default findBufferSize;