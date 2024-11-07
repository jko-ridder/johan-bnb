import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Property from '../../../models/Property';
import Booking from '../../../models/Booking';
import jwt, { JwtPayload } from 'jsonwebtoken';

type Data = {
    success: boolean;
    users?: any[];
    user?: any;
    message?: string;
};

interface DecodedToken extends JwtPayload {
    role: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await dbConnect();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Not authorized' });
        }

        if (req.method === 'GET') {
            const users = await User.find();
            res.status(200).json({ success: true, users });
        } else if (req.method === 'PUT') {
            const { userId, updates } = req.body;
            const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, user: updatedUser });
        } else if (req.method === 'DELETE') {
            const { userId } = req.body;
            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const properties = await Property.find({ host: userId });
            const propertyIds = properties.map(property => property._id);
            await Property.deleteMany({ host: userId });

            await Booking.deleteMany({ user: userId });

            await Booking.deleteMany({ property: { $in: propertyIds } });

            res.status(200).json({ success: true, message: 'User, associated properties, and bookings deleted successfully' });
        } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Failed to process request:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
}