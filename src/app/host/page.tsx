"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

const HostBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                const response = await fetch('/api/bookings/host', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setBookings(data.bookings);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        fetchBookings();
    }, [user]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold mb-6">Bookings for My Properties</h1>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map(booking => (
                        <div key={booking._id} className="bg-white p-4 border border-gray-300 rounded-lg">
                            <h3 className="text-xl font-bold">{booking.property.title}</h3>
                            <p className="text-gray-600">Guest: {booking.user.username}</p>
                            <p className="text-gray-600">Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-600">End Date: {new Date(booking.endDate).toLocaleDateString()}</p>
                            <p className="text-gray-600">Guests: {booking.guests}</p>
                            <p className="text-gray-600">Total Price: {booking.totalPrice} kr</p>
                            <p className="text-gray-600">Special Requests: {booking.specialRequests}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HostBookingsPage;