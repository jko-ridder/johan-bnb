"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import Link from 'next/link';

const UserBookingsPage = () => {
    const { isLoggedIn } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        if (isLoggedIn) {
            const fetchBookings = async () => {
                try {
                    const response = await fetch('/api/bookings/userBookings', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch bookings');
                    }
                    const data = await response.json();
                    setBookings(data.bookings || []);
                } catch (error) {
                    setError(error.message);
                }
            };

            fetchBookings();
        }
    }, [isLoggedIn]);

    const handleCancel = async (bookingId: string) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                const response = await fetch('/api/bookings/userBookings', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ bookingId }),
                });
                if (!response.ok) {
                    throw new Error('Failed to cancel booking');
                }
                setBookings(bookings.filter((booking) => booking._id !== bookingId));
            } catch (error) {
                console.error('Error canceling booking:', error);
                setError(error.message);
            }
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (filterStatus === 'all') return true;
        return booking.status === filterStatus;
    });

    if (!isLoggedIn) {
        return <div className="text-center text-red-500">Please log in to view your bookings</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <label className="block text-gray-700">Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                    </select>
                </div>
            </div>
            <ul className="space-y-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <li key={booking._id} className="p-4 bg-white rounded-lg shadow-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Booking for <Link href={`/properties/${booking.property._id}`} className="text-blue-500 hover:underline">{booking.property.title}</Link>
                                    </h3>
                                    <img src={booking.property.images[0]} alt={booking.property.title} className="w-40 h-auto rounded-lg mb-2" />
                                    <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
                                    <p><strong>End Date:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
                                    <p><strong>Guests:</strong> {booking.guests}</p>
                                    <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
                                    <p><strong>Special Requests:</strong> {booking.specialRequests}</p>
                                    <p>
                                        <strong>Status:</strong> 
                                        <span className={`ml-2 px-2 py-1 rounded-lg ${booking.status === 'approved' ? 'bg-green-500 text-white' : booking.status === 'declined' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {booking.status}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Host:</strong> 
                                        <Link href={`/profiles/${booking.property.host.username}`} className="text-blue-500 hover:underline ml-2">{booking.property.host.username}</Link>
                                    </p>
                                    <p><strong>Host Email:</strong> {booking.property.host.email}</p>
                                </div>
                                {booking.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancel(booking._id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="text-center">No bookings found</li>
                )}
            </ul>
        </div>
    );
};

export default UserBookingsPage;