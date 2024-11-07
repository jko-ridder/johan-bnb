"use client";
import Link from 'next/link';
import { useAuth } from '@/context/authContext';

const Navbar = () => {
    const { isLoggedIn, username, firstName, lastName, profilePicture, logout, role } = useAuth();

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <ul className="flex list-none p-0">
                    <li className="mx-4">
                        <Link href="/" className="text-white hover:text-gray-400">Home</Link>
                    </li>
                    <li className="mx-4">
                        <Link href="/properties" className="text-white hover:text-gray-400">Properties</Link>
                    </li>
                    <li className="mx-4">
                        <Link href="/about" className="text-white hover:text-gray-400">About</Link>
                    </li>
                    <li className="mx-4">
                        <Link href="/contact" className="text-white hover:text-gray-400">Contact</Link>
                    </li>
                </ul>
                <div className="flex items-center">
                    {isLoggedIn ? (
                        <>
                            {role === 'host' ? (
                                <>
                                    <Link href="/properties/create" className="text-white hover:text-gray-400 mx-4">Create Property</Link>
                                    <Link href="/host/properties" className="text-white hover:text-gray-400 mx-4">Manage Properties</Link>
                                    <Link href="/host/bookings" className="text-white hover:text-gray-400 mx-4">Bookings</Link>
                                </>
                            ) : null}
                            {role === 'admin' ? (
                                <>
                                    <Link href="/admin/users" className="text-white hover:text-gray-400 mx-4">Manage Users</Link>
                                    <Link href="/admin/properties" className="text-white hover:text-gray-400 mx-4">Manage Properties</Link>
                                    <Link href="/admin/bookings" className="text-white hover:text-gray-400 mx-4">Manage Bookings</Link>
                                </>
                            ) : null}
                            {role === 'user' ? (
                                <>
                                    <Link href="/bookings" className="text-white hover:text-gray-400 mx-4">Your Bookings</Link>
                                </>
                            ) : null}
                            <Link href={`/profiles/${username}`} className="flex items-center text-white hover:text-gray-400 mx-4">
                                <div className="flex items-center space-x-2">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Profile Picture" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <img src={`https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=32`} alt="Profile Picture" className="w-10 h-10 rounded-full object-cover" />
                                    )}
                                    <span>{username}</span> 
                                </div>
                            </Link>

                            <button onClick={logout} className="text-white hover:text-gray-400 mx-4">Logout</button>
                        </>
                    ) : (
                        <>
                            <span className="text-white mx-4">Welcome, Guest</span>
                            <Link href="/login" className="text-white hover:text-gray-400 mx-4">Login</Link>
                            <Link href="/register" className="text-white hover:text-gray-400 mx-4">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;