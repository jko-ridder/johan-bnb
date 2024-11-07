"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import Link from 'next/link';

const AdminUsersPage = () => {
    const { role } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterRole, setFilterRole] = useState<string>('all');

    useEffect(() => {
        if (role === 'admin') {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/admin/users', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch users');
                    }
                    const data = await response.json();

                    // Fetch properties for each user
                    const usersWithProperties = await Promise.all(
                        data.users.map(async (user: any) => {
                            const propertiesResponse = await fetch(`/api/properties?host=${user._id}`);
                            const propertiesData = await propertiesResponse.json();
                            return {
                                ...user,
                                properties: propertiesData.properties || [],
                            };
                        })
                    );

                    setUsers(usersWithProperties || []);
                } catch (error) {
                    setError(error.message);
                }
            };

            fetchUsers();
        }
    }, [role]);

    const handleEdit = (userId: string) => {
        setEditingUserId(userId);
        const user = users.find((u) => u._id === userId);
        if (user) {
            setEditForm({
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            });
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId: editingUserId, updates: editForm }),
            });
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            const data = await response.json();
            setUsers(users.map((user) => (user._id === editingUserId ? data.user : user)));
            setEditingUserId(null);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch('/api/admin/users', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }
                setUsers(users.filter((user) => user._id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const roleMatch = filterRole === 'all' || user.role === filterRole;
        return (
            roleMatch &&
            (user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.firstName.toLowerCase().includes(query) ||
                user.lastName.toLowerCase().includes(query))
        );
    });

    if (role !== 'admin') {
        return <div className="text-center text-red-500">Access Denied</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <div className="mb-4 flex flex-col md:flex-row md:space-x-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 md:mb-0"
                />
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full md:w-1/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <ul className="space-y-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <li key={user._id} className="p-4 bg-white rounded-lg shadow-md">
                            {editingUserId === user._id ? (
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="mb-2">
                                        <label className="block font-bold">Username:</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={editForm.username}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block font-bold">Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block font-bold">First Name:</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editForm.firstName}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block font-bold">Last Name:</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editForm.lastName}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block font-bold">Role:</label>
                                        <select
                                            name="role"
                                            value={editForm.role}
                                            onChange={handleEditChange}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="user">User</option>
                                            <option value="host">Host</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingUserId(null)}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col md:flex-row md:space-x-4">
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <strong>Username:</strong> <Link href={`/profile/${user.username}`} className="text-blue-500 hover:underline">{user.username}</Link>
                                        </div>
                                        <div>
                                            <strong>Email:</strong> {user.email}
                                        </div>
                                        <div>
                                            <strong>First Name:</strong> {user.firstName}
                                        </div>
                                        <div>
                                            <strong>Last Name:</strong> {user.lastName}
                                        </div>
                                        <div>
                                            <strong>Role:</strong> {user.role}
                                        </div>
                                        <div>
                                            <strong>Properties:</strong> {user.properties.length > 0 ? user.properties.map((property: any) => (
                                                <Link key={property._id} href={`/properties/${property._id}`} className="text-blue-500 hover:underline">{property.title}</Link>
                                            )).reduce((prev, curr) => [prev, ', ', curr]) : 'No properties'}
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleEdit(user._id)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="text-center">No users found</li>
                )}
            </ul>
        </div>
    );
};

export default AdminUsersPage;