import { Inject } from '@nestjs/common';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user.exceptions';
import {
    IUserProfileRepository,
    USER_PROFILE_REPOSITORY,
} from '../../domain/repositories/user-profile.repository.interface';
import {
    IEventPublisher,
    EVENT_PUBLISHER,
} from '../ports/event-publisher.interface';

export interface CreateUserProfileInput {
    userId: string;
    email: string;
}

export class CreateUserProfileUseCase {
    constructor(
        @Inject(USER_PROFILE_REPOSITORY)
        private readonly userProfileRepository: IUserProfileRepository,
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    async execute(input: CreateUserProfileInput): Promise<UserProfile> {
        const existing = await this.userProfileRepository.findById(input.userId);
        if (existing) {
            throw new UserAlreadyExistsException(input.userId);
        }

        const profile = UserProfile.create({
            userId: input.userId,
            email: input.email,
        });

        const saved = await this.userProfileRepository.save(profile);

        await this.eventPublisher.publish({
            eventType: 'user.profile_created',
            payload: {
                userId: saved.userId,
                name: saved.name,
                role: saved.role,
                timestamp: new Date().toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'user-service',
            },
        });

        return saved;
    }
}