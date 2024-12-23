import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { IUser, UserModel } from "../../database/schema/user"
import { IUserFile, UserFileModel } from "../../database/schema/userFile"

@Injectable()
export class UserService {

    userDetails: IUser[] = []

    userRemovedField = { "__v": 0, "createdAt": 0, "updatedAt": 0, "password": 0 }

    async getUser(id: string) {
        try {
            const user: IUser = await UserModel.findOne({ _id: id }, this.userRemovedField);
            if (!user) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.NOT_FOUND,
                        message: 'User Not Found',
                    },
                    HttpStatus.NOT_FOUND
                );
            }
            return { "data": user, "message": "User data retrieve" }
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

    async addUser(userEntryDetails: IUser) {
        try {
            console.log("Inside add user")

            if (!userEntryDetails.name)
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'The request is missing a Name parameter',
                    },
                    HttpStatus.BAD_REQUEST
                );

            if (!userEntryDetails.email)
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'The request is missing a Email parameter',
                    },
                    HttpStatus.BAD_REQUEST
                );

            if (!userEntryDetails.password)
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'The request is missing a Password parameter',
                    },
                    HttpStatus.BAD_REQUEST
                );

            const newUser = new UserModel({
                name: userEntryDetails.name,
                email: userEntryDetails.email,
                password: userEntryDetails.password,
            });

            const user = await newUser.save()

            return {
                statusCode: HttpStatus.OK,
                message: "User created successfully",
                data: { userId: user._id.toString() }
            };

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

    async updateUser(userId: string, userDetail: IUser) {
        try {

            console.log("----------- update user -----------")

            console.log(userDetail)
            const updateResult = await UserModel.updateOne({ "_id": userId }, { "$set": userDetail })

            if (updateResult.modifiedCount === 0) {
                return {
                    data: {},
                    message: "No user found or no changes detected",
                    statusCode: HttpStatus.NOT_FOUND,
                };
            }

            return { "data": { "count": updateResult.modifiedCount }, "message": "User updated successfully", statusCode: HttpStatus.OK }
        }
        catch (error) {
            console.log("Error in update user " + error)
            return { "data": error, "message": "Error in update user", statusCode: HttpStatus.INTERNAL_SERVER_ERROR }
        }
    }

    async userLogin(emailAddress: string, password: string) {
        try {
            const user: IUser = await UserModel.findOne({ email: emailAddress, password: password }, { "__v": 0, "createdAt": 0, "updatedAt": 0, "password": 0 });

            if (!user) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.UNAUTHORIZED,
                        message: 'User log in failed',
                    },
                    HttpStatus.UNAUTHORIZED
                );
            }

            return { "data": { "userId": user._id }, "message": "User log in successfully" };
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

    async userFeed(userId: string) {
        try {

            console.log("----------- Inside userFeed -----------")
            const userDetail = await UserModel.findOne({ "_id": userId }, this.userRemovedField)
            const fileDetail: IUserFile[] = await UserFileModel.find({ "userId": userId }, this.userRemovedField).sort({ "createdAt": -1 })

            const usedSpace = fileDetail.reduce((sum, ele) => sum + ele.fileSize, 0).toFixed(2);

            const availableSpace = 1000 - Number(usedSpace)

            const sharedFile = fileDetail.filter(ele => ele.attachType == "Upload")

            const feed = {
                "userName": userDetail.name.split(' ')[0],
                "bling": 0,
                "availableSpace": availableSpace + " MB",
                "usedSpace": usedSpace + " MB",
                "fileShared": sharedFile.length,
                "fileList": fileDetail,
            }

            return { "data": feed, "message": "User feed generated" }

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
}
