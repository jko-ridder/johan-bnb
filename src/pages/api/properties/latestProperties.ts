import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Property from '../../../models/Property';

type Data = {
    success: boolean;
    properties?: any[];
    message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const properties = await Property.find().sort({ createdAt: -1 }).limit(3);
            res.status(200).json({ success: true, properties });
        } catch (error) {
            console.error('Error fetching latest properties:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch latest properties' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}