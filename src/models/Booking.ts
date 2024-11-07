import mongoose, { Schema, Document } from 'mongoose';

interface IBooking extends Document {
    property: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    guests: number;
    totalPrice: number;
    specialRequests: string;
    status: string;
}

const BookingSchema: Schema = new Schema({
    property: { type: mongoose.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    specialRequests: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);