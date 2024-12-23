
import { IsDefined, IsOptional } from 'class-validator';

export class addUserDTO {
    @IsDefined()
    userId: string;

    @IsDefined()
    firstName: string;

    @IsDefined()
    lastName: string;

    @IsDefined()
    emailAddress: string;

    @IsDefined()
    mobileNumber: string;

    @IsOptional()
    Password: string;
}
