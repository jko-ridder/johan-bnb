import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    await dbConnect();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const hostId = decodedToken.id;

        const properties = await Property.find({ host: hostId }).select('_id');
        const propertyIds = properties.map(property => property._id);

        const bookings = await Booking.find({ property: { $in: propertyIds } }).populate('property').populate('user');

        return NextResponse.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 });
    }
}