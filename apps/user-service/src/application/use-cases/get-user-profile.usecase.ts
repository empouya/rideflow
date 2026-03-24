import { Inject } from '@nestjs/common';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserNotFoundException } from '../../domain/exceptions/user.exceptions';
import {
    IUserProfileRepository,
    USER_PROFILE_REPOSITORY,
} from '../../domain/repositories/user-profile.repository.interface';
import { logger } from '../../common/logger/logger.service';

export interface GetUserProfileInput {
    userId: string;
}

export class GetUserProfileUseCase {
    constructor(
        @Inject(USER_PROFILE_REPOSITORY)
        private readonly userProfileRepository: IUserProfileRepository,
    ) { }

    async execute(input: GetUserProfileInput): Promise<UserProfile> {
        const profile = await this.userProfileRepository.findById(input.userId);

        if (!profile) {
            logger.warn({ userId: input.userId }, 'Profile not found');
            throw new UserNotFoundException(input.userId);
        }

        logger.info({ userId: profile.userId }, 'User profile retrieved successfully');

        return profile;
    }
}