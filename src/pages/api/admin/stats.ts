import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Property from '../../../models/Property';
import Booking from '../../../models/Booking';
import jwt from 'jsonwebtoken';

type Data = {
    success: boolean;
    totalUsers?: number;
    totalProperties?: number;
    totalBookings?: number;
    message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await dbConnect();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        if (decodedToken.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Not authorized' });
        }

        if (req.method === 'GET') {
            const totalUsers = await User.countDocuments();
            const totalProperties = await Property.countDocuments();
            const totalBookings = await Booking.countDocuments();

            res.status(200).json({ success: true, totalUsers, totalProperties, totalBookings });
        } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Failed to process request:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
}