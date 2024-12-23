import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    "userId": string,
    "name": string,
    "email": string,
    "password": string,
    "phone": string,
}

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
}, {
    timestamps: true
});

const UserModel = mongoose.model<IUser>('User', userSchema);
export { UserModel }