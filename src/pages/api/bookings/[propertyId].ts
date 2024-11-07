import { NextApiRequest, NextApiResponse } from 'next';
import Booking from '../../../models/Booking';
import dbConnect from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === 'GET') {
        const { propertyId } = req.query;

        try {
            const bookings = await Booking.find({ property: propertyId });
            res.status(200).json({ success: true, bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}