"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationSelector from '@/components/LocationSelector';
import AmenitiesSelector from '@/components/AmenitiesSelector';

const CreatePropertyPage = () => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [pricePerNight, setPricePerNight] = useState<number>(0);
    const [location, setLocation] = useState<{ country: string, city: string }>({ country: '', city: '' });
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState<string>('');
    const [amenities, setAmenities] = useState<string[]>([]);
    const [maxGuests, setMaxGuests] = useState<number>(0);
    const router = useRouter();

    const handleLocationChange = (country: string, city: string) => {
        setLocation({ country, city });
    };

    const handleAddImage = () => {
        if (newImageUrl.trim() !== '') {
            setImages([...images, newImageUrl.trim()]);
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to create a property.');
            return;
        }

        const response = await fetch('/api/properties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                pricePerNight,
                location,
                images,
                amenities,
                maxGuests
            })
        });

        if (response.ok) {
            router.push('/properties');
        } else {
            alert('Failed to create property');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-6">Create Property</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Price per Night:</label>
                    <input
                        type="number"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(Number(e.target.value))}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Location:</label>
                    <LocationSelector onLocationChange={handleLocationChange} />
                </div>
                <div>
                    <label className="block text-gray-700">Images:</label>
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
                        {images.map((img, index) => (
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
                <div>
                    <label className="block text-gray-700">Amenities:</label>
                    <AmenitiesSelector amenities={amenities} setAmenities={setAmenities} />
                </div>
                <div>
                    <label className="block text-gray-700">Max Guests:</label>
                    <input
                        type="number"
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(Number(e.target.value))}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Create Property
                </button>
            </form>
        </div>
    );
};

export default CreatePropertyPage;