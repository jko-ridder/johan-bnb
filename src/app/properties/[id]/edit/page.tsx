"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LocationSelector from '@/components/LocationSelector';
import AmenitiesSelector from '@/components/AmenitiesSelector';
import { useParams } from 'next/navigation';

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

const EditPropertyPage = () => {
    const router = useRouter();
    const params = useParams();
    const [property, setProperty] = useState<Property | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerNight, setPricePerNight] = useState(0);
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [amenities, setAmenities] = useState<string[]>([]);
    const [maxGuests, setMaxGuests] = useState(0);

    useEffect(() => {
        const fetchProperty = async () => {
            const response = await fetch(`http://localhost:3000/api/properties/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setProperty(data.data);
                setTitle(data.data.title);
                setDescription(data.data.description);
                setPricePerNight(data.data.pricePerNight);
                setCountry(data.data.location.country);
                setCity(data.data.location.city);
                setImages(data.data.images);
                setAmenities(data.data.amenities);
                setMaxGuests(data.data.maxGuests);
            } else {
                console.log('Data fetch was not successful'); // Debugging log
            }
        };

        fetchProperty();
    }, [params.id]);

    const handleLocationChange = (selectedCountry: string, selectedCity: string) => {
        setCountry(selectedCountry);
        setCity(selectedCity);
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
            alert('You must be logged in to edit a property.');
            return;
        }

        const response = await fetch(`/api/properties/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                pricePerNight,
                location: { country, city },
                images,
                amenities,
                maxGuests
            })
        });

        if (response.ok) {
            router.push(`/properties/${params.id}`);
        } else {
            alert('Failed to update property');
        }
    };

    if (!property) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-6">Edit Property</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label className="block text-gray-700">Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="form-group">
                    <label className="block text-gray-700">Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="form-group">
                    <label className="block text-gray-700">Price per Night:</label>
                    <input
                        type="number"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(Number(e.target.value))}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="form-group">
                    <label className="block text-gray-700">Location:</label>
                    <LocationSelector
                        onLocationChange={handleLocationChange}
                        initialCountry={country}
                        initialCity={city}
                    />
                </div>
                <div className="form-group">
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
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
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
                <div className="form-group">
                    <label className="block text-gray-700">Max Guests:</label>
                    <input
                        type="number"
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(Number(e.target.value))}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Update Property
                </button>
            </form>
        </div>
    );
};

export default EditPropertyPage;