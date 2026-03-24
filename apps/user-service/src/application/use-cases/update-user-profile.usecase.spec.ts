import { UpdateUserProfileUseCase } from './update-user-profile.usecase';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { IEventPublisher } from '../ports/event-publisher.interface';
import { UserNotFoundException } from '../../domain/exceptions/user.exceptions';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';

const mockRepository: jest.Mocked<IUserProfileRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
};

const mockEventPublisher: jest.Mocked<IEventPublisher> = {
    publish: jest.fn(),
};

const makeProfile = (name = 'testuser') =>
    new UserProfile(
        'user-123',
        name,
        UserRole.PASSENGER,
        UserStatus.ACTIVE,
        new Date(),
        new Date(),
    );

describe('UpdateUserProfileUseCase', () => {
    let useCase: UpdateUserProfileUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateUserProfileUseCase(mockRepository, mockEventPublisher);
    });

    it('should update a profile and emit user.profile_updated', async () => {
        mockRepository.findById.mockResolvedValue(makeProfile());
        mockRepository.update.mockResolvedValue(makeProfile('Updated Name'));
        mockEventPublisher.publish.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-123',
            name: 'Updated Name',
        });

        expect(result.name).toBe('Updated Name');
        expect(mockRepository.update).toHaveBeenCalled();
        expect(mockEventPublisher.publish).toHaveBeenCalledWith(
            expect.objectContaining({ eventType: 'user.profile_updated' }),
        );
    });

    it('should throw UserNotFoundException when profile does not exist', async () => {
        mockRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({ userId: 'ghost-123', name: 'New Name' }),
        ).rejects.toThrow(UserNotFoundException);

        expect(mockRepository.update).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should only update provided fields', async () => {
        const original = makeProfile('Original Name');
        mockRepository.findById.mockResolvedValue(original);
        mockRepository.update.mockImplementation(async (p) => p);
        mockEventPublisher.publish.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-123',
            phone: '+1234567890',
        });

        expect(result.name).toBe('Original Name');
        expect(result.phone).toBe('+1234567890');
    });
});