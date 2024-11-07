"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PropertyCarousel from "../../components/PropertyCarousel";
import StarRating from "../../components/StarRating";

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

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("price-asc");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  const [uniqueAmenities, setUniqueAmenities] = useState<string[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: string]: boolean;
  }>({});

  const propertiesPerPage = 6;
  const maxDescriptionLength = 100;

  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/properties");
        const data = await response.json();

        if (data.success) {
          setProperties(data.properties);
          setFilteredProperties(data.properties);
        } else {
          console.log("Data fetch was not successful");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const uniqueCountries = Array.from(
      new Set(properties.map((property) => property.location.country))
    );

    const uniqueCities = Array.from(
      new Set(
        properties
          .filter((property) => property.location.country === selectedCountry)
          .map((property) => property.location.city)
      )
    );

    const uniqueAmenities = Array.from(
      new Set(properties.flatMap((property) => property.amenities))
    );

    setUniqueCountries(uniqueCountries);
    setUniqueCities(uniqueCities);
    setUniqueAmenities(uniqueAmenities);
  }, [properties, selectedCountry]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prevSelectedAmenities) => {
      if (prevSelectedAmenities.includes(amenity)) {
        return prevSelectedAmenities.filter(
          (selectedAmenity) => selectedAmenity !== amenity
        );
      } else {
        return [...prevSelectedAmenities, amenity];
      }
    });
  };

  const applyFilters = () => {
    const filtered = properties.filter((property) => {
      if (selectedCountry && property.location.country !== selectedCountry) {
        return false;
      }
      if (selectedCity && property.location.city !== selectedCity) {
        return false;
      }
      if (
        selectedAmenities.length > 0 &&
        !selectedAmenities.every((amenity) =>
          property.amenities.includes(amenity)
        )
      ) {
        return false;
      }
      return true;
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === "price-asc") {
      return a.pricePerNight - b.pricePerNight;
    } else if (sortOption === "price-desc") {
      return b.pricePerNight - a.pricePerNight;
    } else if (sortOption === "rating-asc") {
      return a.rating - b.rating;
    } else if (sortOption === "rating-desc") {
      return b.rating - a.rating;
    }
    return 0;
  });

  useEffect(() => {
    applyFilters();
  }, [selectedCountry, selectedCity, selectedAmenities]);

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = sortedProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getExcerpt = (text: string) => {
    if (text.length <= maxDescriptionLength) {
      return text;
    }
    return text.slice(0, maxDescriptionLength) + "...";
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">Properties</h1>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700">
              Country:
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block text-gray-700">
              City:
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedCountry}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="amenities" className="block text-gray-700">
              Amenities:
            </label>
            <div id="amenities" className="flex flex-wrap gap-2">
              {uniqueAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    value={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="mr-2"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="sort" className="block text-gray-700">
          Sort:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-asc">Rating: Low to High</option>
          <option value="rating-desc">Rating: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProperties.map((property) => (
          <div
            key={property._id}
            className="border rounded-lg overflow-hidden shadow-lg"
          >
            <PropertyCarousel images={property.images} title={property.title} />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{property.title}</h2>
              <p className="text-gray-600">
                {expandedDescriptions[property._id]
                  ? property.description
                  : getExcerpt(property.description)}
                {property.description.length > maxDescriptionLength && (
                  <button
                    onClick={() => toggleDescription(property._id)}
                    className=" hover:underline ml-2"
                  >
                    {expandedDescriptions[property._id] ? "Read Less" : "Read More"}
                  </button>
                )}
              </p>
              <p>
                <strong>Location:</strong> {property.location.city},{" "}
                {property.location.country}
              </p>
              <p className="text-lg font-bold">
                Price per night: {property.pricePerNight} kr SEK
              </p>
              <StarRating rating={property.rating} />
              <p className="mt-2">
                <strong>Host:</strong>{" "}
                <span
                  onClick={() =>
                    router.push(`/profiles/${property.host.username}`)
                  }
                  className="text-blue-500 cursor-pointer"
                >
                  {property.host.username}
                </span>
              </p>
              <button
                onClick={() => router.push(`/properties/${property._id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <nav>
          <ul className="flex space-x-2">
            {Array.from({ length: Math.ceil(filteredProperties.length / propertiesPerPage) }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    index + 1 === currentPage
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Properties;