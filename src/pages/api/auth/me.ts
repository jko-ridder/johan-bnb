import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        res.status(200).json({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            role: user.role,
        });
    } catch (error) {
        console.error('Failed to verify user status:', error);
        return res.status(500).json({ message: 'Failed to verify user status' });
    }
}