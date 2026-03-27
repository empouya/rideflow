import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { GetDriverUseCase } from '../../application/use-cases/get-driver.usecase';
import { RegisterDriverUseCase } from '../../application/use-cases/register-driver.usecase';
import { UpdateDriverStatusUseCase } from '../../application/use-cases/update-driver-status.usecase';
import { Driver } from '../../domain/entities/driver.entity';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RegisterDriverDto } from '../dtos/register-driver.dto';
import { UpdateDriverStatusDto } from '../dtos/update-driver-status.dto';

@Controller('drivers')
export class DriverController {
    constructor(
        private readonly registerDriverUseCase: RegisterDriverUseCase,
        private readonly getDriverUseCase: GetDriverUseCase,
        private readonly updateDriverStatusUseCase: UpdateDriverStatusUseCase,
    ) { }

    @Post('register')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async registerDriver(
        @Body() dto: RegisterDriverDto,
        @Req() req: Request,
    ): Promise<Driver> {
        const requester = (req as any).user as { userId: string };

        return this.registerDriverUseCase.execute({
            userId: requester.userId,
            licenseNumber: dto.licenseNumber,
            licenseCountry: dto.licenseCountry,
            licenseExpiresAt: new Date(dto.licenseExpiresAt),
            vehicleMake: dto.vehicleMake,
            vehicleModel: dto.vehicleModel,
            vehicleColor: dto.vehicleColor,
            plateNumber: dto.plateNumber,
            vehicleYear: dto.vehicleYear,
            seatCount: dto.seatCount,
            vehicleCategory: dto.vehicleCategory,
            inspectionExpiresAt: new Date(dto.inspectionExpiresAt),
        });
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getDriver(
        @Param('id') id: string,
        @Req() req: Request,
    ): Promise<Driver> {
        this.ensureOwnership(id, req);
        return this.getDriverUseCase.execute({ userId: id });
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateDriverStatus(
        @Param('id') id: string,
        @Body() dto: UpdateDriverStatusDto,
        @Req() req: Request,
    ): Promise<Driver> {
        this.ensureOwnership(id, req);

        return this.updateDriverStatusUseCase.execute({
            userId: id,
            status: dto.status,
        });
    }

    private ensureOwnership(id: string, req: Request): void {
        const requester = (req as any).user as { userId: string };
        if (requester.userId !== id) {
            throw new ForbiddenException('Cannot access another driver profile');
        }
    }
}
