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
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UpdateLocationUseCase } from '../../application/use-cases/update-location.usecase';
import { FindNearbyDriversUseCase } from '../../application/use-cases/find-nearby-drivers.usecase';
import { GetDriverLocationUseCase } from '../../application/use-cases/get-driver-location.usecase';
import { JwtAuthGuard, AuthenticatedRequest } from '../../infrastructure/guards/jwt-auth.guard';
import { UpdateLocationDto } from '../dtos/update-location.dto';
import { FindNearbyDto } from '../dtos/find-nearby.dto';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {
    constructor(
        private readonly updateLocationUseCase: UpdateLocationUseCase,
        private readonly findNearbyDriversUseCase: FindNearbyDriversUseCase,
        private readonly getDriverLocationUseCase: GetDriverLocationUseCase,
    ) { }

    @Post('update')
    @HttpCode(HttpStatus.OK)
    async updateLocation(
        @Body() body: UpdateLocationDto,
        @Req() request: AuthenticatedRequest,
    ): Promise<{ message: string }> {
        if (request.user?.userId !== body.driverId) {
            throw new ForbiddenException('You can only update your own location');
        }

        await this.updateLocationUseCase.execute({
            driverId: body.driverId,
            latitude: body.latitude,
            longitude: body.longitude,
        });

        return { message: 'Location updated' };
    }

    @Get('nearby')
    @HttpCode(HttpStatus.OK)
    async findNearby(
        @Query() query: FindNearbyDto,
    ): Promise<{
        drivers: Array<{
            driverId: string;
            latitude: number;
            longitude: number;
            timestamp: string;
        }>;
    }> {
        const drivers = await this.findNearbyDriversUseCase.execute({
            latitude: query.latitude,
            longitude: query.longitude,
            radiusKm: query.radiusKm,
            limit: query.limit,
        });

        return {
            drivers: drivers.map((driver) => ({
                driverId: driver.driverId,
                latitude: driver.latitude,
                longitude: driver.longitude,
                timestamp: driver.timestamp.toISOString(),
            })),
        };
    }

    @Get('drivers/:driverId')
    @HttpCode(HttpStatus.OK)
    async getDriverLocation(
        @Param('driverId') driverId: string,
    ): Promise<{
        driverId: string;
        latitude: number;
        longitude: number;
        timestamp: string;
    }> {
        const location = await this.getDriverLocationUseCase.execute({ driverId });

        return {
            driverId: location.driverId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp.toISOString(),
        };
    }
}
