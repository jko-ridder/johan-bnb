"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DatePicker, Space, Tooltip, DatePickerProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);

const { RangePicker } = DatePicker;

interface BookingFormProps {
    propertyId: string;
    pricePerNight: number;
    maxGuests: number;
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, pricePerNight, maxGuests }) => {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [bookedDates, setBookedDates] = useState<{ start: Dayjs, end: Dayjs }[]>([]);
    const [guests, setGuests] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchBookedDates = async () => {
            const response = await fetch(`/api/bookings/${propertyId}`);
            const data = await response.json();
            if (data.success) {
                const dates = data.bookings.map((booking: any) => ({
                    start: dayjs(booking.startDate),
                    end: dayjs(booking.endDate)
                }));
                setBookedDates(dates);
            }
        };

        fetchBookedDates();
    }, [propertyId]);

    const calculateTotalPrice = () => {
        if (!dateRange) return 0;
        const start = dateRange[0];
        const end = dateRange[1];
        const days = end.diff(start, 'days') + 1;
        return days * pricePerNight;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (guests > maxGuests) {
            setErrorMessage(`The maximum number of guests allowed is ${maxGuests}.`);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to book a property.');
            return;
        }

        const totalPrice = calculateTotalPrice();

        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                property: propertyId,
                startDate: dateRange ? dateRange[0].toISOString() : null,
                endDate: dateRange ? dateRange[1].toISOString() : null,
                guests,
                totalPrice,
                specialRequests,
                status: 'pending',
            })
        });

        if (response.ok) {
            alert('Booking successful!');
            router.push('/bookings');
        } else {
            alert('Failed to create booking');
        }
    };

    const disabledDate = (current: Dayjs) => {
        return current.isBefore(dayjs(), 'day') || bookedDates.some(({ start, end }) => current.isBetween(start, end, 'day', '[]'));
    };

    const cellRender: DatePickerProps['cellRender'] = (current, info) => {
        const style: React.CSSProperties = {};
        if (dayjs.isDayjs(current) && bookedDates.some(({ start, end }) => current.isBetween(start, end, 'day', '[]'))) {
            style.border = '1px solid red';
            style.color = 'white';
            style.background = 'red';
        }
        return (
            <div className="ant-picker-cell-inner" style={style}>
                {dayjs.isDayjs(current) ? current.date() : ''}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700">Date Range:</label>
                <Space direction="vertical" size={12}>
                    <RangePicker
                        onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                        disabledDate={disabledDate}
                        cellRender={cellRender}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </Space>
                <div className="flex items-center mt-2">
                    <ExclamationCircleOutlined style={{ color: 'red', marginRight: '8px' }} />
                    <span className="text-gray-700">Red dates indicate the property is booked.</span>
                </div>
            </div>
            <div>
                <label className="block text-gray-700">Guests:</label>
                <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
                {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            </div>
            <div>
                <label className="block text-gray-700">Special Requests:</label>
                <textarea
                    placeholder='Any special requests? (Optional)'
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-700">Total Price:</label>
                <input
                    type="text"
                    value={calculateTotalPrice() + ' kr SEK'}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Book Property
            </button>
        </form>
    );
};

export default BookingForm;