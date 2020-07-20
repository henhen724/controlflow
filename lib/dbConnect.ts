import mongoose from 'mongoose';
mongoose.set('useCreateIndex', true);

const connection = { isConnected: false };


const dbConnect = async () => {
    if (connection.isConnected) return;
    const db = await mongoose.connect(`${process.env.MONGODB_PROTO}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log(`🗃️ Connected to the database at ${process.env.MONGODB_PROTO}${process.env.MONGODB_DOMAIN}`);
    connection.isConnected = !!db.connections[0].readyState;
}

export default dbConnect;