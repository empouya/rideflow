import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsISO8601,
    IsOptional,
    IsString,
    Length,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { VehicleCategory } from '../../domain/enums/vehicle-category.enum';

export class RegisterDriverDto {
    @IsString()
    @MinLength(4)
    @MaxLength(32)
    licenseNumber!: string;

    @IsString()
    @Length(2, 3)
    licenseCountry!: string;

    @IsISO8601()
    licenseExpiresAt!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(32)
    vehicleMake!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(32)
    vehicleModel!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(24)
    vehicleColor!: string;

    @IsString()
    @MinLength(4)
    @MaxLength(16)
    plateNumber!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1980)
    @Max(2100)
    vehicleYear!: number;

    @Type(() => Number)
    @IsInt()
    @Min(2)
    @Max(8)
    seatCount!: number;

    @IsOptional()
    @IsEnum(VehicleCategory)
    vehicleCategory?: VehicleCategory;

    @IsISO8601()
    inspectionExpiresAt!: string;
}
