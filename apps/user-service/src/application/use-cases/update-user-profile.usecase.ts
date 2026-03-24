import { Inject } from '@nestjs/common';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserNotFoundException } from '../../domain/exceptions/user.exceptions';
import {
    IUserProfileRepository,
    USER_PROFILE_REPOSITORY,
} from '../../domain/repositories/user-profile.repository.interface';
import {
    IEventPublisher,
    EVENT_PUBLISHER,
} from '../ports/event-publisher.interface';
import { logger } from '../../common/logger/logger.service';

export interface UpdateUserProfileInput {
    userId: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
}

export class UpdateUserProfileUseCase {
    constructor(
        @Inject(USER_PROFILE_REPOSITORY)
        private readonly userProfileRepository: IUserProfileRepository,
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    async execute(input: UpdateUserProfileInput): Promise<UserProfile> {
        const existing = await this.userProfileRepository.findById(input.userId);

        if (!existing) {
            logger.warn({ userId: input.userId }, 'Profile update failed: user not found');
            throw new UserNotFoundException(input.userId);
        }

        const updated = existing.update({
            name: input.name,
            phone: input.phone,
            avatarUrl: input.avatarUrl,
        });

        const saved = await this.userProfileRepository.update(updated);

        await this.eventPublisher.publish({
            eventType: 'user.profile_updated',
            payload: {
                userId: saved.userId,
                name: saved.name,
                phone: saved.phone ?? null,
                avatarUrl: saved.avatarUrl ?? null,
                timestamp: new Date().toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'user-service',
            },
        });

        logger.info({ userId: saved.userId, name: saved.name }, 'User profile updated successfully');

        return saved;
    }
}