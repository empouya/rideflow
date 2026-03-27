import { Inject } from '@nestjs/common';
import { logger } from '../../common/logger/logger.service';
import { Driver } from '../../domain/entities/driver.entity';
import {
    DRIVER_REPOSITORY,
    IDriverRepository,
} from '../../domain/repositories/driver.repository.interface';

export interface ProvisionDriverInput {
    userId: string;
}

export class ProvisionDriverUseCase {
    constructor(
        @Inject(DRIVER_REPOSITORY)
        private readonly driverRepository: IDriverRepository,
    ) { }

    async execute(input: ProvisionDriverInput): Promise<Driver> {
        const existing = await this.driverRepository.findById(input.userId);
        if (existing) {
            logger.debug({ userId: input.userId }, 'Driver already provisioned');
            return existing;
        }

        const driver = Driver.provision(input.userId);
        const saved = await this.driverRepository.save(driver);

        logger.info({ userId: input.userId }, 'Driver profile provisioned from user profile event');

        return saved;
    }
}
