"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import BookingForm from '@/components/BookingForm';

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

const PropertyPage = () => {
    const router = useRouter();
    const params = useParams();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        const fetchProperty = async () => {
            const response = await fetch(`http://localhost:3000/api/properties/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setProperty(data.data);
            } else {
                console.log('Data fetch was not successful');
            }
        };

        fetchProperty();
    }, [params.id]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const base64Url = tokenParts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedToken = JSON.parse(atob(base64));
                    setLoggedInUserId(decodedToken.id);
                    setRole(decodedToken.role || '');
                    setIsLoggedIn(true);
                } else {
                    console.error('Invalid token format');
                }
            } catch (error) {
                console.error('Failed to decode token:', error);
                localStorage.removeItem('token');
                setIsLoggedIn(false);
            }
        }
    }, []);

    useEffect(() => {
        if (property) {
            console.log('Property:', property);
        }
    }, [isLoggedIn, loggedInUserId, role]);

    if (!property) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const isHostOrAdmin = isLoggedIn && (loggedInUserId === property.host._id || role === 'admin');

    const handleDeleteProperty = async () => {
        if (confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await fetch(`/api/properties/${property._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const result = await response.json();

                if (result.success) {
                    alert('Property deleted successfully');
                    router.push('/');
                } else {
                    console.log('Failed to delete property:', result.message);
                }
            } catch (error) {
                console.error('Error deleting property:', error);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-6">{property.title}</h1>
            <Carousel showThumbs={true} infiniteLoop={true} showStatus={false} className="rounded-lg overflow-hidden">
                {property.images.map((image, index) => (
                    <div key={index} className="h-64 md:h-80">
                        <img src={image} alt={`${property.title} image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </Carousel>
            <div className="mt-6 text-gray-700">
                <p className="mb-4">{property.description}</p>
                <p className="mb-2"><strong>Location:</strong> {property.location.city}, {property.location.country}</p>
                <p className="mb-2"><strong>Price per Night:</strong> {property.pricePerNight} kr</p>
                <p className="mb-2"><strong>Max Guests:</strong> {property.maxGuests}</p>
                <p className="mb-2"><strong>Rating:</strong> {property.rating}</p>
                <p className="mb-2"><strong>Host:</strong> <span onClick={() => router.push(`/profiles/${property.host.username}`)} className="text-blue-500 cursor-pointer hover:underline">{property.host.username}</span></p>
                <p className="mb-2"><strong>Amenities:</strong> {property.amenities.join(', ')}</p>
                <BookingForm propertyId={property._id} pricePerNight={property.pricePerNight} maxGuests={property.maxGuests} />
                {isHostOrAdmin && (
                    <>
                        <button className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={() => router.push(`/properties/${property._id}/edit`)}>Edit Property</button>
                        <button className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={handleDeleteProperty}>Delete Property</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertyPage;