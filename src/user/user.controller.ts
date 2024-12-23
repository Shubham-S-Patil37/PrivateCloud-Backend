import { Controller, Get, Post, Res, Put, Request, Body, HttpStatus, Param, Query, Response, } from '@nestjs/common';
import { UserService } from "./user.service"
import { addUserDTO } from "./dto/addUser.Dto"

@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @Get(':id')
    getUser(@Param('id') id: string) {
        const resp = this.userService.getUser(id)
        return resp;
    }

    @Post('/')
    async createUser(@Body() body) {
        const resp = await this.userService.addUser(body)
        return resp;
    }

    @Put(":id")
    updateUser(@Param('id') id: string, @Body() body) {
        return this.userService.updateUser(id, body)
    }

    @Post('/login')
    login(@Body() body) {
        return this.userService.userLogin(body.emailAddress, body.password)
    }

    @Get('/userFeed/:id')
    userFeed(@Param('id') id: string) {
        const resp = this.userService.userFeed(id)
        return resp;
    }
}
