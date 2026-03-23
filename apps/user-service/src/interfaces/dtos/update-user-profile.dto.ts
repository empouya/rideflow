import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(64, { message: 'Name must not exceed 64 characters' })
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(7, { message: 'Phone must be at least 7 characters' })
    @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
    phone?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
    avatarUrl?: string;
}