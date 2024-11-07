import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import jwt from 'jsonwebtoken';

type Data = {
    success: boolean;
    bookings?: any[];
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
            const bookings = await Booking.find({ user: decodedToken.id })
                .populate({
                    path: 'property',
                    populate: {
                        path: 'host',
                        model: 'User',
                        select: 'username email',
                    },
                });
            res.status(200).json({ success: true, bookings });
        } else if (req.method === 'DELETE') {
            const { bookingId } = req.body;
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            if (booking.user.toString() !== decodedToken.id) {
                return res.status(403).json({ success: false, message: 'Forbidden: Not authorized' });
            }

            if (booking.status !== 'pending') {
                return res.status(400).json({ success: false, message: 'Only pending bookings can be canceled' });
            }

            await Booking.findByIdAndDelete(bookingId);
            res.status(200).json({ success: true, message: 'Booking canceled successfully' });
        } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Failed to process request:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
}