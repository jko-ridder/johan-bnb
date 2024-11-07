import React from 'react';

interface StarRatingProps {
    rating: number; // Rating between 0 and 5
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    // Array of star elements, which could include half stars
    const stars = Array.from({ length: 5 }, (_, index) => {
        if (rating >= index + 1) {
            return 'full'; // Full star
        } else if (rating >= index + 0.5) {
            return 'half'; // Half star
        }
        return 'empty'; // Empty star
    });

    return (
        <div className="flex space-x-1">
            {stars.map((star, index) => (
                <span key={index} className="text-gray-500">
                    {star === 'full' ? (
                        <i className="fas fa-star" /> // Full star
                    ) : star === 'half' ? (
                        <i className="fas fa-star-half-alt" /> // Half star
                    ) : (
                        <i className="far fa-star" /> // Empty star
                    )}
                </span>
            ))}
        </div>
    );
};

export default StarRating;
