import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import dbConnect from '../../../lib/db';

type Data = {
    message: string;
    success?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'POST') {
        await dbConnect();
        const { username, email, password, firstName, lastName, profilePicture } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists', success: false });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                profilePicture,

            });
            await user.save();
            res.status(201).json({ message: 'User created successfully', success: true });
        } catch (error) {
            res.status(500).json({ message: 'User creation failed', success: false });
        }
      }  else {
            res.status(405).json({ message: 'Method Not Allowed', success: false });
        }
}