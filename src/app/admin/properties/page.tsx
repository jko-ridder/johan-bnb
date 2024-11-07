"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import Link from 'next/link';
import LocationSelector from '@/components/LocationSelector';
import AmenitiesSelector from '@/components/AmenitiesSelector';

const AdminPropertiesPage = () => {
    const { role } = useAuth();
    const [properties, setProperties] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [filterHost, setFilterHost] = useState<string>('all');
    const [newImageUrl, setNewImageUrl] = useState<string>('');

    useEffect(() => {
        if (role === 'admin') {
            const fetchProperties = async () => {
                try {
                    const response = await fetch('/api/admin/properties', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch properties');
                    }
                    const data = await response.json();
                    setProperties(data.properties || []);
                } catch (error) {
                    setError(error.message);
                }
            };

            fetchProperties();
        }
    }, [role]);

    const handleDelete = async (propertyId: string) => {
        if (confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await fetch('/api/admin/properties', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ propertyId }),
                });
                if (!response.ok) {
                    throw new Error('Failed to delete property');
                }
                setProperties(properties.filter((property) => property._id !== propertyId));
            } catch (error) {
                console.error('Error deleting property:', error);
                setError(error.message);
            }
        }
    };

    const handleEdit = (property: any) => {
        setEditingProperty(property);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditingProperty((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLocationChange = (country: string, city: string) => {
        setEditingProperty((prev: any) => ({
            ...prev,
            location: { country, city },
        }));
    };

    const handleAddImage = () => {
        if (newImageUrl.trim() !== '') {
            setEditingProperty((prev: any) => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()],
            }));
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setEditingProperty((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, i: number) => i !== index),
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/properties', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ propertyId: editingProperty._id, updates: editingProperty }),
            });
            if (!response.ok) {
                throw new Error('Failed to update property');
            }
            const data = await response.json();
            setProperties(properties.map((property) => (property._id === editingProperty._id ? data.property : property)));
            setEditingProperty(null);
        } catch (error) {
            console.error('Error updating property:', error);
            setError(error.message);
        }
    };

    const filteredProperties = properties.filter((property) =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterHost === 'all' || property.host._id === filterHost)
    );

    const groupedProperties = filteredProperties.reduce((acc, property) => {
        const hostId = property.host._id;
        if (!acc[hostId]) {
            acc[hostId] = [];
        }
        acc[hostId].push(property);
        return acc;
    }, {});

    const hosts = properties.reduce((acc, property) => {
        if (!acc.some((host: any) => host._id === property.host._id)) {
            acc.push(property.host);
        }
        return acc;
    }, []);

    if (role !== 'admin') {
        return <div className="text-center text-red-500">Access Denied</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Properties</h1>
            <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
            />
            <select
                value={filterHost}
                onChange={(e) => setFilterHost(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
            >
                <option value="all">All Hosts</option>
                {hosts.map((host: any) => (
                    <option key={host._id} value={host._id}>{host.username}</option>
                ))}
            </select>
            {Object.keys(groupedProperties).length > 0 ? (
                Object.keys(groupedProperties).map((hostId) => (
                    <div key={hostId} className="mb-8">
                        <h2 className="text-xl font-bold mb-2">
                            Host: <Link href={`/profile/${groupedProperties[hostId][0].host.username}`} className="text-blue-500 hover:underline">{groupedProperties[hostId][0].host.username}</Link>
                        </h2>
                        <ul className="space-y-4">
                            {groupedProperties[hostId].map((property) => (
                                <li key={property._id} className="p-4 bg-white rounded-lg shadow-md">
                                    {editingProperty && editingProperty._id === property._id ? (
                                        <form onSubmit={handleEditSubmit} className="space-y-4">
                                            <div className="mb-2">
                                                <label className="block font-bold">Title:</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={editingProperty.title}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block font-bold">Description:</label>
                                                <textarea
                                                    name="description"
                                                    value={editingProperty.description}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block font-bold">Price per Night:</label>
                                                <input
                                                    type="number"
                                                    name="pricePerNight"
                                                    value={editingProperty.pricePerNight}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block font-bold">Location:</label>
                                                <LocationSelector onLocationChange={handleLocationChange} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block font-bold">Images:</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={newImageUrl}
                                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                                        placeholder="Enter image URL"
                                                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddImage}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        Add Image
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {editingProperty.images.map((img: string, index: number) => (
                                                        <div key={index} className="relative">
                                                            <img src={img} alt={`Image ${index + 1}`} className="w-24 h-24 object-cover rounded-lg border" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <label className="block font-bold">Amenities:</label>
                                                <AmenitiesSelector amenities={editingProperty.amenities} setAmenities={(amenities: string[]) => setEditingProperty((prev: any) => ({ ...prev, amenities }))} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="block font-bold">Max Guests:</label>
                                                <input
                                                    type="number"
                                                    name="maxGuests"
                                                    value={editingProperty.maxGuests}
                                                    onChange={handleEditChange}
                                                    className="w-full p-2 border rounded"
                                                />
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
                                                    onClick={() => setEditingProperty(null)}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold">{property.title}</h3>
                                                <p>{property.description}</p>
                                                <p><strong>Location:</strong> {property.location.city}, {property.location.country}</p>
                                                <p><strong>Price per night: </strong>{property.pricePerNight} kr SEK</p>
                                                <p><strong>Max guests:</strong> {property.maxGuests}</p>
                                                <p><strong>Amenities:</strong> {property.amenities.join(', ')}</p>
                                            </div>
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => handleEdit(property)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(property._id)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <div className="text-center">No properties found</div>
            )}
        </div>
    );
};

export default AdminPropertiesPage;