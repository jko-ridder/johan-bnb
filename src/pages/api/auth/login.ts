import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/User';
import dbConnect from '../../../lib/db';

type Data = {
    message: string;
    token?: string;
    success?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'POST') {
        await dbConnect();
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User not found', success: false });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials', success: false });
            }
            const token = jwt.sign(
                {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    profilePicture: user.profilePicture || '',
                    role: user.role || 'user', 
                },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );
            res.status(200).json({ message: 'User logged in successfully', token, success: true });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'User login failed', success: false });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed', success: false });
    }
}