import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Booking from '../../../models/Booking';
import User from '../../../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

type Data = {
    success: boolean;
    bookings?: any[];
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
            const bookings = await Booking.find().populate('property').populate('user');
            const bookingsWithHost = await Promise.all(
                bookings.map(async (booking) => {
                    const host = await User.findById(booking.property.host);
                    return {
                        ...booking.toObject(),
                        property: {
                            ...booking.property.toObject(),
                            host: host ? host.toObject() : null,
                        },
                    };
                })
            );

            res.status(200).json({ success: true, bookings: bookingsWithHost });
        } else if (req.method === 'PUT') {
            const { bookingId, updates } = req.body;
            const updateFields = {
                startDate: updates.startDate,
                endDate: updates.endDate,
                guests: updates.guests,
                totalPrice: updates.totalPrice,
                specialRequests: updates.specialRequests,
                status: updates.status,
            };
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updateFields, { new: true }).populate('property').populate('user');
            if (!updatedBooking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            const host = await User.findById(updatedBooking.property.host);
            const updatedBookingWithHost = {
                ...updatedBooking.toObject(),
                property: {
                    ...updatedBooking.property.toObject(),
                    host: host ? host.toObject() : null,
                },
            };
            res.status(200).json({ success: true, bookings: [updatedBookingWithHost] });
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