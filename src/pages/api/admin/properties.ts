import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Property from '../../../models/Property';
import Booking from '../../../models/Booking';
import jwt, { JwtPayload } from 'jsonwebtoken';

type Data = {
    success: boolean;
    properties?: any[];
    property?: any;
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
            const properties = await Property.find().populate('host');
            res.status(200).json({ success: true, properties });
        } else if (req.method === 'PUT') {
            const { propertyId, updates } = req.body;
            const updatedProperty = await Property.findByIdAndUpdate(propertyId, updates, { new: true });
            if (!updatedProperty) {
                return res.status(404).json({ success: false, message: 'Property not found' });
            }
            res.status(200).json({ success: true, property: updatedProperty });
        } else if (req.method === 'DELETE') {
            const { propertyId } = req.body;
            const deletedProperty = await Property.findByIdAndDelete(propertyId);
            if (!deletedProperty) {
                return res.status(404).json({ success: false, message: 'Property not found' });
            }

            await Booking.deleteMany({ property: propertyId });
            
            res.status(200).json({ success: true, message: 'Property and associated bookings deleted successfully' });
        } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Failed to process request:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
}