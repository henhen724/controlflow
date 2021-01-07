import { calculateObjectSize } from 'bson';
import DataPacket from '../models/DataPacket';
import ArchiveDataPacket from '../models/ArchiveDataPacket';

export const findBufferSize = async (topic: string) => {
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

export const findArchiveSize = async (topic: string) => {
    const numOfPackets = await ArchiveDataPacket.countDocuments({ topic });
    const examplePacket = await ArchiveDataPacket.findOne({ topic });
    var packetSize = 1000;
    if (examplePacket) {
        examplePacket.toJSON()
        packetSize = calculateObjectSize(examplePacket);
    }

    const total_size = numOfPackets * packetSize;
    return { total_size, packetSize };
}
