"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import dayjs from 'dayjs';

const HostBookingsPage = () => {
    const { role, username } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [statusChanges, setStatusChanges] = useState<{ [key: string]: string }>({});
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterUser, setFilterUser] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('newest');

    useEffect(() => {
        if (role === 'host') {
            const fetchBookings = async () => {
                try {
                    const response = await fetch(`/api/host/bookings?host=${username}`, {
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
    }, [role, username]);

    const handleDelete = async (bookingId: string) => {
        if (confirm('Are you sure you want to delete this booking?')) {
            try {
                const response = await fetch('/api/host/bookings', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ bookingId }),
                });
                if (!response.ok) {
                    throw new Error('Failed to delete booking');
                }
                setBookings(bookings.filter((booking) => booking._id !== bookingId));
            } catch (error) {
                console.error('Error deleting booking:', error);
                setError(error.message);
            }
        }
    };

    const handleStatusChange = (bookingId: string, status: string) => {
        setStatusChanges((prev) => ({ ...prev, [bookingId]: status }));
    };

    const applyStatusChange = async (bookingId: string) => {
        const status = statusChanges[bookingId];
        try {
            const response = await fetch('/api/host/bookings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ bookingId, status }),
            });
            if (!response.ok) {
                throw new Error('Failed to update booking status');
            }
            const data = await response.json();
            setBookings(bookings.map((booking) => (booking._id === bookingId ? data.booking : booking)));
            setStatusChanges((prev) => {
                const newStatusChanges = { ...prev };
                delete newStatusChanges[bookingId];
                return newStatusChanges;
            });
        } catch (error) {
            console.error('Error updating booking status:', error);
            setError(error.message);
        }
    };

    const calculateTotalNights = (startDate: string, endDate: string) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return end.diff(start, 'day');
    };

    const filteredBookings = bookings.filter((booking) => {
        const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
        const userMatch = filterUser === 'all' || booking.user.username === filterUser;
        return statusMatch && userMatch;
    });

    const sortedBookings = filteredBookings.sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        } else if (sortOrder === 'oldest') {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        }
        return 0;
    });

    const sortedAndFilteredBookings = [
        ...sortedBookings.filter((booking) => booking.status !== 'declined'),
        ...sortedBookings.filter((booking) => booking.status === 'declined'),
    ];

    if (role !== 'host') {
        return <div className="text-center text-red-500">Access Denied</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Manage Bookings</h1>
            <div className="flex flex-wrap justify-center items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-auto">
                    <label className="block text-gray-700">Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                    </select>
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-gray-700">Filter by User:</label>
                    <select
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        {Array.from(new Set(bookings.map((booking) => booking.user.username))).map((user) => (
                            <option key={user} value={user}>
                                {user}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-gray-700">Sort by:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>
            <ul className="space-y-6">
                {sortedAndFilteredBookings.length > 0 ? (
                    sortedAndFilteredBookings.map((booking) => (
                        <li key={booking._id} className={`p-6 bg-white rounded-lg shadow-md ${booking.status === 'declined' ? 'border border-red-500' : booking.status === 'approved' ? 'border border-green-500' : ''}`}>
                            <div className="flex flex-col md:flex-row md:space-x-6">
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <strong>Property:</strong> <br /><a href={`/properties/${booking.property._id}`} className='text-blue-500 hover:underline'>{booking.property.title}</a>
                                    </div>
                                    <div>
                                        <strong>Guest info:</strong> <br/>Username: <a href={`/profiles/${booking.user.username}`} className="text-blue-500 hover:underline">{booking.user.username}</a>
                                        <p>Name:  {booking.user.firstName} {booking.user.lastName} </p>
                                        <p>Email: {booking.user.email}</p>
                                    </div>
                                    <div>
                                        <strong>Start Date:</strong> <br />{new Date(booking.startDate).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <strong>End Date:</strong> <br />{new Date(booking.endDate).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <strong>Total Nights:</strong><br /> {calculateTotalNights(booking.startDate, booking.endDate)}
                                    </div>
                                    <div>
                                        <strong>Price Per Night:</strong> <br /> {booking.pricePerNight} kr SEK
                                    </div>
                                    <div>
                                        <strong>Guests:</strong> <br />{booking.guests}
                                    </div>
                                    <div>
                                        <strong>Total Price:</strong> <br />{calculateTotalNights(booking.startDate, booking.endDate)} nights * {booking.pricePerNight} kr = {booking.totalPrice} kr SEK
                                    </div>
                                    <div>
                                        <strong>Special Requests:</strong> <br />{booking.specialRequests}
                                    </div>
                                    <div>
                                        <strong>Status:</strong> <br />
                                        <select
                                            value={statusChanges[booking._id] || booking.status}
                                            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                            className="px-4 py-2 border rounded"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                        <button
                                            onClick={() => applyStatusChange(booking._id)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-2"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    <div className="flex space-x-4 justify-center">
                                        <button
                                            onClick={() => handleDelete(booking._id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-2 md:mb-0 flex justify-center items-center">
                                    <img src={booking.property.images[0]} alt={booking.property.title} className="w-40 h-auto rounded-lg" />
                                </div>
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

export default HostBookingsPage;