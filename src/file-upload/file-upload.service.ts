import { IUserFile, UserFileModel } from './../../database/schema/userFile';
import { IUser, UserModel } from "./../../database/schema/user"
import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class FileUploadService {

    private readonly uploadDir = './uploads';

    async getUserFiles(userId: string) {
        try {
            const userFiles = await UserFileModel.find({ "userId": userId, "isDeleted": false }, { "__v": 0, "createdAt": 0, "updatedAt": 0 }).sort({ "createdAt": -1 });
            return { "data": userFiles, "message": "user file details" };
        }
        catch (error) {
            if (error instanceof HttpException)
                throw error;

            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'An unexpected error occurred ' + error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );

        }
    }

    async uploadUserFile(userId: string, file: Express.Multer.File, fileDetails: IUserFile) {


        const fileData = {
            userId,
            fileIdentifierName: fileDetails.fileName,
            fileName: file.filename,
            fileType: file.mimetype,
            fileSize: fileDetails.fileSize,
            attachType: 'Upload',
            "isDeleted": false
        };
        const uploadedFile = new UserFileModel(fileData);
        const savedFile = await uploadedFile.save();
        return {
            statusCode: HttpStatus.OK,
            message: 'File uploaded successfully',
            fileId: savedFile._id.toString(),
        };
    }

    async shareFile(fileDetails: IUserFile) {
        try {

            console.log("Inside shareFile")

            if (!fileDetails.userEmailAddress)
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'Parameter missing user id',
                    },
                    HttpStatus.BAD_REQUEST
                );


            if (!fileDetails.userId)
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'Parameter missing Shared By',
                    },
                    HttpStatus.BAD_REQUEST
                );

            if (!fileDetails.fileId)
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'Parameter missing File Id',
                    },
                    HttpStatus.BAD_REQUEST
                );


            fileDetails.attachType = "Upload"
            fileDetails.isDeleted = false

            const userData = await UserModel.findOne({ "email": fileDetails.userEmailAddress })

            if (!userData) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.NOT_FOUND,
                        message: 'Email Address is not register',
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            const fileData = await UserFileModel.findOne({ "_id": fileDetails.fileId })

            if (!fileData) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.NOT_FOUND,
                        message: 'File is not register',
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            const timestamp = Date.now();
            const fileName = `${timestamp}-${fileData.fileIdentifierName}`

            const fileDataToAdd = {
                userId: userData._id,
                fileName: fileName,
                fileIdentifierName: fileData.fileIdentifierName,
                fileType: fileData.fileType,
                fileSize: fileData.fileSize,
                attachType: "Shared",
                sharedBy: fileDetails.userId,
                isDeleted: false
            }

            const userFile = await new UserFileModel(fileDataToAdd).save();

            return { "data": { "fileId": userFile._id }, "message": "File Shared" }

        }
        catch (error) {
            if (error instanceof HttpException)
                throw error;

            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'An unexpected error occurred ' + error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );

        }
    }

    async deleteFile(userId: string, fileId: string) {

        try {
            const userFile_Details = UserFileModel.find({ "_id": fileId, "userId": userId })

            if (!userFile_Details)
                throw new HttpException(
                    { statusCode: HttpStatus.NOT_FOUND, message: 'File not exist for user' },
                    HttpStatus.NOT_FOUND
                )

            const deleteFile = UserFileModel.updateOne({ "_id": fileId }, { "$set": { "isDeleted": true } })

            return {
                "data": {},
                "message": "file Deleted."
            }
        }
        catch (error) {
            console.log(error)
            if (error instanceof HttpException)
                throw error;

            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'An unexpected error occurred ' + error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
