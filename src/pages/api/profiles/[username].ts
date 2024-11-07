import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Property from '../../../models/Property';
import jwt, { JwtPayload } from 'jsonwebtoken';

type Data = {
    success: boolean;
    profile?: {
        _id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        bio: string;
        profilePicture: string;
        properties: string[];
    };
    message?: string;
};

interface DecodedToken extends JwtPayload {
    role: string;
    username: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await dbConnect();

    const { username } = req.query;

    const usernameStr = Array.isArray(username) ? username[0] : username;

    if (req.method === 'GET') {
        try {
            const user = await User.findOne({ username: usernameStr }).populate('properties');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const profile = {
                _id: user._id.toString(),
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                properties: user.properties.map((property: any) => property._id.toString()),
            };

            res.status(200).json({ success: true, profile });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch profile' });
        }
    } else if (req.method === 'PUT') {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

            if (decoded.role !== 'admin' && decoded.username !== usernameStr) {
                return res.status(403).json({ success: false, message: 'Forbidden: Not authorized to update this user' });
            }

            const { firstName, lastName, email, bio, profilePicture } = req.body;

            const updatedUser = await User.findOneAndUpdate(
                { username: usernameStr },
                { firstName, lastName, email, bio, profilePicture },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const profile = {
                _id: updatedUser._id.toString(),
                username: updatedUser.username,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                properties: updatedUser.properties.map((property: any) => property._id.toString()),
            };

            res.status(200).json({ success: true, profile });
        } catch (error) {
            console.error('Failed to update profile:', error);
            res.status(500).json({ success: false, message: 'Failed to update profile' });
        }
    } else if (req.method === 'DELETE') {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

            if (decoded.role !== 'admin' && decoded.username !== usernameStr) {
                return res.status(403).json({ success: false, message: 'Forbidden: Not authorized to delete this user' });
            }

            const user = await User.findOne({ username: usernameStr }).populate('properties');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const userId = user._id;

            const deletedProperties = await Property.deleteMany({ host: userId });
            console.log(`Deleted ${deletedProperties.deletedCount} properties owned by ${usernameStr}`);

            await User.findByIdAndDelete(userId);

            res.status(200).json({ success: true, message: 'User and associated properties successfully deleted' });
        } catch (error) {
            console.error('Failed to delete user and properties:', error);
            res.status(500).json({ success: false, message: 'Failed to delete user or invalid token' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}