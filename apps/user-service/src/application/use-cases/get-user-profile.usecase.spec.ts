import { GetUserProfileUseCase } from './get-user-profile.usecase';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { UserNotFoundException } from '../../domain/exceptions/user.exceptions';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';

const mockRepository: jest.Mocked<IUserProfileRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
};

const makeProfile = () =>
    new UserProfile(
        'user-123',
        'testuser',
        UserRole.PASSENGER,
        UserStatus.ACTIVE,
        new Date(),
        new Date(),
    );

describe('GetUserProfileUseCase', () => {
    let useCase: GetUserProfileUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetUserProfileUseCase(mockRepository);
    });

    it('should return a user profile', async () => {
        mockRepository.findById.mockResolvedValue(makeProfile());

        const result = await useCase.execute({ userId: 'user-123' });

        expect(result.userId).toBe('user-123');
        expect(result.name).toBe('testuser');
        expect(mockRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw UserNotFoundException when profile does not exist', async () => {
        mockRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({ userId: 'ghost-123' }),
        ).rejects.toThrow(UserNotFoundException);
    });
});