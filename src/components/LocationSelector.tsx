import { useState, useEffect } from 'react';

interface Country {
    country: string;
    cities: string[];
}

interface LocationSelectorProps {
    onLocationChange: (country: string, city: string) => void;
    initialCountry: string;
    initialCity: string;
}

const LocationSelector = ({ onLocationChange, initialCountry, initialCity }: LocationSelectorProps) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
    const [selectedCity, setSelectedCity] = useState<string>(initialCity);
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        const fetchCountries = async () => {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries');
            const data = await response.json();
            setCountries(data.data);
            const selectedCountryData = data.data.find((c: Country) => c.country === initialCountry);
            setCities(selectedCountryData ? selectedCountryData.cities : []);
        };

        fetchCountries();
    }, [initialCountry]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        setSelectedCountry(country);
        const selectedCountryData = countries.find(c => c.country === country);
        setCities(selectedCountryData ? selectedCountryData.cities : []);
        setSelectedCity('');
        onLocationChange(country, '');
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value;
        setSelectedCity(city);
        onLocationChange(selectedCountry, city);
    };

    return (
        <div>
            <label htmlFor="country">Country:</label>
            <select id="country" value={selectedCountry} onChange={handleCountryChange}>
                <option value="">Select a country</option>
                {countries.map((country) => (
                    <option key={country.country} value={country.country}>{country.country}</option>
                ))}
            </select>

            <label htmlFor="city">City:</label>
            <select id="city" value={selectedCity} onChange={handleCityChange} disabled={!selectedCountry}>
                <option value="">Select a city</option>
                {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>
        </div>
    );
};

export default LocationSelector;