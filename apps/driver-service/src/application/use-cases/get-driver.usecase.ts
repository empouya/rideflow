import { Inject } from '@nestjs/common';
import { Driver } from '../../domain/entities/driver.entity';
import { DriverNotFoundException } from '../../domain/exceptions/driver.exceptions';
import {
    DRIVER_REPOSITORY,
    IDriverRepository,
} from '../../domain/repositories/driver.repository.interface';

export interface GetDriverInput {
    userId: string;
}

export class GetDriverUseCase {
    constructor(
        @Inject(DRIVER_REPOSITORY)
        private readonly driverRepository: IDriverRepository,
    ) { }

    async execute(input: GetDriverInput): Promise<Driver> {
        const driver = await this.driverRepository.findById(input.userId);

        if (!driver) {
            throw new DriverNotFoundException(input.userId);
        }

        return driver;
    }
}
