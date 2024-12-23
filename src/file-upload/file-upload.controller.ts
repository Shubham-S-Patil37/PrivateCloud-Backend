import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';  // Correct import for file upload handling
import { Express } from 'express';  // Import Express types for correct file type annotation
import * as path from 'path';
import * as fs from 'fs';
import * as multer from 'multer';

@Controller('file-upload')
export class FileUploadController {

    constructor(private fileUploadService: FileUploadService) { }

    @Get('/userFile/:userId')
    async getUserFile(@Param('userId') userId: string) {
        return this.fileUploadService.getUserFiles(userId)
    }

    @Post('/shareFile')
    async fileShared(@Body() body) {
        return await this.fileUploadService.shareFile(body)
    }

    @Post(':userId')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = './uploads';
                if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                const ext = path.extname(file.originalname);
                cb(null, `${timestamp}-${file.originalname}`);
            },
        }),
    }))
    async uploadUserFile(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File, @Body() body) {
        return await this.fileUploadService.uploadUserFile(userId, file, body);
    }

    @Delete(":userId/:fileId")
    async deleteFile(@Param('userId') userId: string, @Param('fileId') fileId: string) {
        return await this.fileUploadService.deleteFile(userId, fileId)
    }

}
