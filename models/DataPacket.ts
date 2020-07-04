import mongoose from 'mongoose';

// Defining the typescript interfaces which user will use.

const DataSchema = new mongoose.Schema({
    experationDate: {
        type: Date,
        required: false
    },
    topic: {
        type: String,
        required: [true, "This data packet must have a topic."],
    },
    data: {
        type: String,
        required: [true, "This data packet has no content/data."],
    },
})

export default mongoose.models.DataPacket || mongoose.model('DataPacket', DataSchema, 'data');