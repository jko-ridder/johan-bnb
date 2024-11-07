"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/authContext';

interface Profile {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    profilePicture?: string;
    properties: string[];
}

interface Property {
    _id: string;
    title: string;
    description: string;
    pricePerNight: number;
    location: {
        country: string;
        city: string;
    };
    images: string[];
    amenities: string[];
    maxGuests: number;
    rating: number;
    reviews: string[];
    host: {
        _id: string;
        username: string;
    };
}

const ProfilePage = () => {
    const router = useRouter();
    const params = useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const { isLoggedIn, username: loggedInUsername, role } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!params?.username) return;
            const response = await fetch(`/api/profiles/${params.username}`);
            const data = await response.json();

            if (data.success) {
                setProfile(data.profile);
            } else {
                console.log('Data fetch was not successful');
            }
        };

        fetchProfile();
    }, [params?.username]);

    useEffect(() => {
        const fetchProperties = async () => {
            const response = await fetch(`/api/properties`);
            const data = await response.json();

            if (data.success) {
                const filteredProperties = data.properties.filter(
                    (property: Property) => params && property.host.username === params.username
                );
                setProperties(filteredProperties);
            } else {
                console.log('Properties fetch was not successful');
            }
        };

        if (profile) {
            fetchProperties();
        }
    }, [profile, params?.username]);

    if (!profile) {
        return <div>Loading...</div>;
    }

    const handleEditProfile = () => {
        router.push(`/profiles/${profile.username}/edit`);
    };

    const handleDeleteUser = async () => {
        try {
            const userResponse = await fetch(`/api/profiles/${profile.username}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const userData = await userResponse.json();

            if (!userData.success || !userData.profile?._id) {
                console.log('Failed to retrieve user ID');
                return;
            }

            const userId = userData.profile._id;
            const userProperties = userData.profile.properties;

            console.log('User Properties:', userProperties);

            const propertiesResponse = await fetch(`/api/properties?hostId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const propertiesData = await propertiesResponse.json();

            if (propertiesData.success) {
                const filteredProperties = propertiesData.properties.filter(
                    (property: Property) => property.host._id === userId
                );

                const propertyList = filteredProperties.map((property: Property) => `${property.title} (Host: ${property.host.username})`).join('\n');
                const confirmationMessage = `Are you sure you want to delete this user and all associated properties?\n\n\nUser to be deleted:\n${profile.username}\n\n\nProperties to be deleted:\n${propertyList}`;
                console.log('Confirmation Message:', confirmationMessage);

                if (confirm(confirmationMessage)) {
                    for (const propertyId of userProperties) {
                        await fetch(`/api/properties/${propertyId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        });
                    }
                    const deleteUserResponse = await fetch(`/api/profiles/${profile.username}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });

                    const deleteUserResult = await deleteUserResponse.json();

                    if (deleteUserResult.success) {
                        alert('User and all associated properties successfully deleted');
                        router.push('/');
                    } else {
                        console.log('Failed to delete user:', deleteUserResult.message);
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting user and properties:', error);
        }
    };

    const handleDeleteProperty = async (propertyId: string) => {
        const propertyToDelete = properties.find(property => property._id === propertyId);
        if (!propertyToDelete) {
            console.error('Property not found');
            return;
        }
    
        const confirmationMessage = `Are you sure you want to delete the property "${propertyToDelete.title}"? This action cannot be undone.`;
        const confirmed = window.confirm(confirmationMessage);
    
        if (!confirmed) {
            return;
        }
    
        try {
            const response = await fetch(`/api/properties/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                setProperties(properties.filter(property => property._id !== propertyId));
            } else {
                const data = await response.json();
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting property:', error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-6">
                {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile Picture" className="w-32 h-32 rounded-full object-cover mr-4" />
                ) : (
                    <img src={`https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&size=128`} alt="Profile Picture" className="w-32 h-32 rounded-full object-cover mr-4" />
                )}
                <div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-gray-600">{profile.firstName} {profile.lastName}</p>
                    <p className="text-gray-600">{profile.email}</p>
                    <p className="text-gray-600">{profile.bio}</p>
                    {isLoggedIn && loggedInUsername === profile.username && (
                        <button onClick={handleEditProfile} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Edit Profile</button>
                    )}
                    {role === 'admin' && (
                        <button onClick={handleDeleteUser} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete User</button>
                    )}
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">{profile.username}'s Properties:</h2>
            {properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                        <div key={property._id} className="bg-white p-4 border border-gray-300 rounded-lg">
                            <img src={property.images[0]} alt={property.title} className="w-full h-60 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-bold">
                                <a href={`/properties/${property._id}`} className="text-blue-500 hover:underline">
                                    {property.title}
                                </a>
                            </h3>
                            <p className="text-gray-600">{property.description.length > 50 ? `${property.description.substring(0, 50)}...` : property.description}</p>
                            <p className="text-gray-600">{property.location.city}, {property.location.country}</p>
                            <p className="text-gray-600">Price per night: {property.pricePerNight} kr SEK</p>
                            {isLoggedIn && (loggedInUsername === profile.username || role === 'admin') && (
                                <>
                                    <button onClick={() => router.push(`/properties/${property._id}/edit`)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Edit Property</button>
                                    <button onClick={() => handleDeleteProperty(property._id)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete Property</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">No properties found for this user.</p>
            )}
        </div>
    );
};

export default ProfilePage;