import mongoose, { Schema, Document } from 'mongoose';

export interface IUserFile extends Document {
    "_id": string,
    "userId": string,
    "fileName": string,
    "fileIdentifierName": string,
    "fileType": string,
    "fileSize": number,
    "attachType": string,
    "sharedBy": string,
    "isDeleted": boolean,
    "userEmailAddress": string,
    "fileId": string,
    "__v": number;
}

const userFileSchema = new Schema({
    userId: { type: String, required: true },
    fileName: { type: String, required: true, unique: true },
    fileIdentifierName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    attachType: { type: String, required: true },
    sharedBy: { type: String },
    isDeleted: { type: Boolean, required: true },
}, {
    timestamps: true
});

const UserFileModel = mongoose.model<IUserFile>('UserFile', userFileSchema);

export { UserFileModel }
