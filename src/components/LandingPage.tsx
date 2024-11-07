"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import Link from 'next/link';

const LandingPage = () => {
    const { role, isLoggedIn } = useAuth();
    const [latestProperties, setLatestProperties] = useState<any[]>([]);
    const [pendingBookings, setPendingBookings] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalProperties, setTotalProperties] = useState<number>(0);
    const [totalBookings, setTotalBookings] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestProperties = async () => {
            try {
                const response = await fetch('/api/properties/latestProperties');
                if (!response.ok) {
                    throw new Error('Failed to fetch latest properties');
                }
                const data = await response.json();
                setLatestProperties(data.properties || []);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchPendingBookings = async () => {
            try {
                const response = await fetch('/api/bookings/pendingBookings', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch pending bookings');
                }
                const data = await response.json();
                setPendingBookings(data.pendingBookings || 0);
            } catch (error) {
                setError(error.message);
            }
        };

        const fetchAdminStats = async () => {
            try {
                const response = await fetch('/api/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch admin stats');
                }
                const data = await response.json();
                setTotalUsers(data.totalUsers || 0);
                setTotalProperties(data.totalProperties || 0);
                setTotalBookings(data.totalBookings || 0);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchLatestProperties();

        if (role === 'host') {
            fetchPendingBookings();
        } else if (role === 'admin') {
            fetchAdminStats();
        }
    }, [role]);

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            {role === 'user' && (
                <>
                    <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Johan-BnB</h1>
                    <h2 className="text-2xl font-bold mb-4 text-center">Latest Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestProperties.map((property) => (
                            <div key={property._id} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <img src={property.images[0]} alt={property.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                                <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                                <p className="text-gray-700 mb-4">{property.description}</p>
                                <Link href={`/properties/${property._id}`} className="text-blue-500 hover:underline">View Property</Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {role === 'host' && (
                <>
                    <h1 className="text-4xl font-bold mb-6 text-center">Host Dashboard</h1>
                    <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-4">Pending Bookings</h2>
                        <p className="text-gray-700 mb-4">You have {pendingBookings} pending bookings.</p>
                        <Link href="/host/bookings" className="text-blue-500 hover:underline">Manage Bookings</Link>
                        <Link href="/host/properties" className="text-blue-500 hover:underline block mt-4">Manage Properties</Link>
                    </div>
                </>
            )}
            {role === 'admin' && (
                <>
                    <h1 className="text-4xl font-bold mb-6 text-center">Admin Dashboard</h1>
                    <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-4">Site Statistics</h2>
                        <p className="text-gray-700 mb-2">Total Users: {totalUsers}</p>
                        <p className="text-gray-700 mb-2">Total Properties: {totalProperties}</p>
                        <p className="text-gray-700 mb-4">Total Bookings: {totalBookings}</p>
                        <Link href="/admin/users" className="text-blue-500 hover:underline block mb-2">Manage Users</Link>
                        <Link href="/admin/properties" className="text-blue-500 hover:underline block mb-2">Manage Properties</Link>
                        <Link href="/admin/bookings" className="text-blue-500 hover:underline">Manage Bookings</Link>
                    </div>
                </>
            )}
            {!isLoggedIn && (
                <>
                    <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Johan-BnB</h1>
                    <h2 className="text-2xl font-bold mb-4 text-center">Latest Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {latestProperties.map((property) => (
                            <div key={property._id} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <img src={property.images[0]} alt={property.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                                <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                                <p className="text-gray-700 mb-4">{property.description}</p>
                                <Link href={`/properties/${property._id}`} className="text-blue-500 hover:underline">View Property</Link>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-center text-gray-700">Log in or Create an account to start booking properties!</p>
                    <div className="text-center mt-4">
                        <Link href="/login" className="text-blue-500 hover:underline text-lg">Login</Link>
                        <span className="mx-2 text-gray-500">or</span>
                        <Link href="/register" className="text-blue-500 hover:underline text-lg">Register here!</Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default LandingPage;