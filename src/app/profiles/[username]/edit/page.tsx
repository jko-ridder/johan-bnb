"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Profile {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    profilePicture?: string;
}

const EditProfilePage = () => {
    const router = useRouter();
    const params = useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`/api/profiles/${params.username}`);
            const data = await response.json();

            if (data.success) {
                setProfile(data.profile);
                setFirstName(data.profile.firstName);
                setLastName(data.profile.lastName);
                setEmail(data.profile.email);
                setBio(data.profile.bio);
                setProfilePicture(data.profile.profilePicture || '');
            } else {
                console.error('Failed to fetch profile');
            }
        };

        fetchProfile();
    }, [params.username]);

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/profiles/${params.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ firstName, lastName, email, bio, profilePicture }),
        });

        if (response.ok) {
            router.push(`/profiles/${params.username}`);
        } else {
            console.error('Failed to save profile');
        }
    };

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
            <div className="mb-4">
                <label className="block text-gray-700">Profile Picture:</label>
                {profilePicture ? (
                    <img src={profilePicture} alt="Profile Picture" className="w-32 h-32 rounded-full object-cover mb-2" />
                ) : (
                    <img src={`https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&size=128`} alt="Profile Picture" className="w-32 h-32 rounded-full object-cover mb-2" />
                )}
                <input
                    type="text"
                    placeholder="Enter image URL"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">First Name:</label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Last Name:</label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Bio:</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                />
            </div>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save</button>
        </div>
    );
};

export default EditProfilePage;