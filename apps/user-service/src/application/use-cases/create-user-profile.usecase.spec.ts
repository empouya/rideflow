import { CreateUserProfileUseCase } from './create-user-profile.usecase';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { IEventPublisher } from '../ports/event-publisher.interface';
import { UserAlreadyExistsException } from '../../domain/exceptions/user.exceptions';
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

const makeProfile = (userId = 'user-123', name = 'testuser') =>
    new UserProfile(
        userId,
        name,
        UserRole.PASSENGER,
        UserStatus.ACTIVE,
        new Date(),
        new Date(),
    );

describe('CreateUserProfileUseCase', () => {
    let useCase: CreateUserProfileUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateUserProfileUseCase(mockRepository, mockEventPublisher);
    });

    it('should create a profile and emit user.profile_created', async () => {
        mockRepository.findById.mockResolvedValue(null);
        mockRepository.save.mockResolvedValue(makeProfile());
        mockEventPublisher.publish.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-123',
            email: 'testuser@rideflow.com',
        });

        expect(result.userId).toBe('user-123');
        expect(result.role).toBe(UserRole.PASSENGER);
        expect(result.status).toBe(UserStatus.ACTIVE);
        expect(mockRepository.save).toHaveBeenCalled();
        expect(mockEventPublisher.publish).toHaveBeenCalledWith(
            expect.objectContaining({ eventType: 'user.profile_created' }),
        );
    });

    it('should derive name from email prefix', async () => {
        mockRepository.findById.mockResolvedValue(null);
        mockRepository.save.mockImplementation(async (p) => p);
        mockEventPublisher.publish.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-123',
            email: 'johndoe@rideflow.com',
        });

        expect(result.name).toBe('johndoe');
    });

    it('should throw UserAlreadyExistsException if profile exists', async () => {
        mockRepository.findById.mockResolvedValue(makeProfile());

        await expect(
            useCase.execute({ userId: 'user-123', email: 'testuser@rideflow.com' }),
        ).rejects.toThrow(UserAlreadyExistsException);

        expect(mockRepository.save).not.toHaveBeenCalled();
        expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });
});