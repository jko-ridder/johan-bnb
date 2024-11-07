import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import Property from '../../../models/Property';
import User from '../../../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

type Data = {
    success: boolean;
    bookings?: any[];
    booking?: any;
    message?: string;
};

interface DecodedToken extends JwtPayload {
    username: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await dbConnect();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

        if (req.method === 'GET') {
            const { host } = req.query;
            const hostUser = await User.findOne({ username: host });
            if (!hostUser) {
                return res.status(404).json({ success: false, message: 'Host not found' });
            }
            const properties = await Property.find({ host: hostUser._id });
            const propertyIds = properties.map(property => property._id);
            const bookings = await Booking.find({ property: { $in: propertyIds } }).populate('property').populate('user');
            res.status(200).json({ success: true, bookings });
        } else if (req.method === 'PUT') {
            const { bookingId, status } = req.body;
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true }).populate('property').populate('user');
            if (!updatedBooking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.status(200).json({ success: true, booking: updatedBooking });
        } else if (req.method === 'DELETE') {
            const { bookingId } = req.body;
            const deletedBooking = await Booking.findByIdAndDelete(bookingId);
            if (!deletedBooking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.status(200).json({ success: true, message: 'Booking deleted successfully' });
        } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Failed to process request:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
}