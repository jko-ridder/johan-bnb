import { NextApiRequest, NextApiResponse } from 'next';
import Booking from '../../../models/Booking';
import dbConnect from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        await dbConnect();
        const { property, user, startDate, endDate, guests, totalPrice, specialRequests } = req.body;
        try {
            const booking = new Booking({
                property,
                user,
                startDate,
                endDate,
                guests,
                totalPrice,
                specialRequests,
            });
            await booking.save();
            res.status(201).json({ success: true, data: booking, message: 'Booking created successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Booking creation failed' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
    
}