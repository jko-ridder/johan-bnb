import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import jwt from 'jsonwebtoken';

type Data = {
    success: boolean;
    pendingBookings?: number;
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

        if (req.method === 'GET') {
            const pendingBookings = await Booking.countDocuments({ host: decodedToken.id, status: 'pending' });
            res.status(200).json({ success: true, pendingBookings });
        } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Failed to process request:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
}