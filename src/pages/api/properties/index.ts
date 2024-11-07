import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Property from '../../../models/Property';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

type Data = {
    success: boolean;
    properties?: any[];
    property?: any;
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
            const { title, description, pricePerNight, location, images, amenities, maxGuests } = req.body;

            if (!location || !location.country || !location.city) {
                return res.status(400).json({ success: false, message: 'Please provide a valid location' });
            }

            console.log('Creating property with data:', {
                title,
                description,
                pricePerNight,
                location,
                images,
                amenities,
                maxGuests,
                host: decodedToken.id,
            });

            const property = new Property({
                title,
                description,
                pricePerNight,
                location,
                images,
                amenities,
                maxGuests,
                host: decodedToken.id,
            });

            await property.save();

            await User.findByIdAndUpdate(decodedToken.id, {
                $push: { properties: property._id },
            });

            res.status(201).json({ success: true, property });
        } catch (error) {
            console.error('Error creating property:', error);
            res.status(500).json({ success: false, message: 'Failed to create property' });
        }
    } else if (req.method === 'GET') {
        const { host } = req.query;
        try {
            const query = host ? { host } : {};
            console.log('Fetching properties with query:', query);
            const properties = await Property.find(query).populate('host', 'username');
            console.log('Fetched properties:', properties);
            res.status(200).json({ success: true, properties });
        } catch (error) {
            console.error('Error fetching properties:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch properties' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}