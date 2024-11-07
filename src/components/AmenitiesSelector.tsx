"use client";
import { useState } from 'react';

const predefinedAmenities = [
    'WiFi',
    'Air Conditioning',
    'Heating',
    'Kitchen',
    'Parking',
    'Pool',
    'Gym',
    'Washer',
    'Dryer',
    'TV',
    'Hot Tub',
    'Fireplace',
    'Balcony',
    'Garden',
    'BBQ Grill',
    'Dishwasher',
    'Microwave',
    'Refrigerator',
    'Stove',
    'Oven',
];

const AmenityItem = ({ amenity, index, onRemove }: { amenity: string, index: number, onRemove: (index: number) => void }) => (
    <div className="flex items-center space-x-2 bg-gray-200 rounded-lg px-2 py-1">
        <span>{amenity}</span>
        <button
            type="button"
            onClick={() => onRemove(index)}
            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
            &times;
        </button>
    </div>
);

const PredefinedAmenityItem = ({ amenity, onAdd }: { amenity: string, onAdd: (amenity: string) => void }) => (
    <div className="flex items-center justify-between bg-gray-100 rounded-lg px-2 py-1">
        <span>{amenity}</span>
        <button
            type="button"
            onClick={() => onAdd(amenity)}
            className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            +
        </button>
    </div>
);

const AmenitiesSelector = ({ amenities, setAmenities }: { amenities: string[], setAmenities: (amenities: string[]) => void }) => {
    const [newAmenity, setNewAmenity] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showAllAmenities, setShowAllAmenities] = useState<boolean>(false);

    const handleAddAmenity = (amenity: string) => {
        if (amenity.trim() !== '' && !amenities.includes(amenity.trim())) {
            setAmenities([...amenities, amenity.trim()]);
        }
    };

    const handleRemoveAmenity = (index: number) => {
        setAmenities(amenities.filter((_, i) => i !== index));
    };

    const filteredAmenities = predefinedAmenities.filter(amenity =>
        amenity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const amenitiesToShow = showAllAmenities ? filteredAmenities : filteredAmenities.slice(0, 10);

    return (
        <div>
            <div className="mb-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search amenities"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
                {amenitiesToShow.map((amenity) => (
                    <PredefinedAmenityItem key={amenity} amenity={amenity} onAdd={handleAddAmenity} />
                ))}
            </div>
            {filteredAmenities.length > 10 && !showAllAmenities && (
                <button
                    type="button"
                    onClick={() => setShowAllAmenities(true)}
                    className="text-blue-500 hover:underline"
                >
                    Show more
                </button>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
                {amenities.map((amenity, index) => (
                    <AmenityItem key={index} amenity={amenity} index={index} onRemove={handleRemoveAmenity} />
                ))}
            </div>
            {searchTerm && !filteredAmenities.includes(searchTerm) && (
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={searchTerm}
                        readOnly
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => handleAddAmenity(searchTerm)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add "{searchTerm}"
                    </button>
                </div>
            )}
        </div>
    );
};

export default AmenitiesSelector;