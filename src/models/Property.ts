import mongoose, { Schema, Document } from 'mongoose';

interface ILocation {
    country: string;
    city: string;
}

interface IProperty extends Document {
    title: string;
    description: string;
    pricePerNight: number;
    location: ILocation;
    images: string[];
    amenities: string[];
    maxGuests: number;
    rating: number;
    reviews: string[];
    host: mongoose.Types.ObjectId;
}

const locationSchema: Schema = new Schema({
    country: { type: String, required: true },
    city: { type: String, required: true },
});

const propertySchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        pricePerNight: { type: Number, required: true },
        location: { type: locationSchema, required: true },
        images: { type: [String], required: true },
        amenities: { type: [String], required: true },
        maxGuests: { type: Number, required: true },
        rating: { type: Number, min: 1, max: 5, default: 3 },
        reviews: { type: [String], default: [] },
        host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Property || mongoose.model<IProperty>('Property', propertySchema);