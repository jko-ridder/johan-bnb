import mongoose, { Schema, Document } from 'mongoose';

enum UserRole {
    User = 'user',
    Host = 'host',
    Admin = 'admin',
}

interface IUser extends Document {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    password: string;
    role: UserRole;
    properties: mongoose.Types.ObjectId[];
    profilePicture?: string;
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.User },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    profilePicture: { type: String },
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);