import { calculateObjectSize } from 'bson';
import DataPacket from '../models/DataPacket';

const findBufferSize = async (topic: string) => {
    const numOfPackets = await DataPacket.countDocuments({ topic });
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