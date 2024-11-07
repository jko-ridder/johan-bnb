import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL as string, {
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed');
        process.exit(1);
    }
};

export default connectDB;