import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import Property from '../../../models/Property';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

type Data = {
    success: boolean;
    booking?: any;
    message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await dbConnect();

    if (req.method === 'POST') {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            const { property, startDate, endDate, guests, totalPrice, specialRequests } = req.body;

            const propertyExists = await Property.findById(property);
            const userExists = await User.findById(decodedToken.id);

            if (!propertyExists || !userExists) {
                return res.status(400).json({ success: false, message: 'Invalid property or user' });
            }

            const booking = new Booking({
                property,
                user: decodedToken.id,
                startDate,
                endDate,
                guests,
                totalPrice,
                specialRequests,
                status: 'pending',
            });

            await booking.save();

            res.status(201).json({ success: true, booking });
        } catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({ success: false, message: 'Failed to create booking' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}