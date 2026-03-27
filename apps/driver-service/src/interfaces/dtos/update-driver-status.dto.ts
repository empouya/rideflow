import { IsEnum } from 'class-validator';
import { DriverStatus } from '../../domain/enums/driver-status.enum';

export class UpdateDriverStatusDto {
    @IsEnum(DriverStatus)
    status!: DriverStatus;
}
