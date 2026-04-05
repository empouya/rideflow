import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FindNearbyDto {
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude!: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude!: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.1)
    @Max(50)
    radiusKm!: number;

    @Transform(({ value }) => value === undefined ? 10 : parseInt(value, 10))
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    limit: number = 10;
}
