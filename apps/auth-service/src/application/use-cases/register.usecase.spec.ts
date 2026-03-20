import { RegisterUseCase } from './register.usecase';
import { ICredentialRepository } from '../../domain/repositories/credential.repository.interface';
import { IPasswordService } from '../ports/password.service.interface';
import { ITokenService, TokenPair } from '../ports/token.service.interface';
import { EmailAlreadyExistsException } from '../../domain/exceptions/auth.exceptions';
import { Credential, AuthProvider } from '../../domain/entities/credential.entity';

const mockCredentialRepository: jest.Mocked<ICredentialRepository> = {
    save: jest.fn(),
    findByEmail: jest.fn(),
    findByUserId: jest.fn(),
};

const mockPasswordService: jest.Mocked<IPasswordService> = {
    hash: jest.fn(),
    compare: jest.fn(),
};

const mockTokenService: jest.Mocked<ITokenService> = {
    generateTokenPair: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
};

describe('RegisterUseCase', () => {
    let useCase: RegisterUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new RegisterUseCase(
            mockCredentialRepository,
            mockPasswordService,
            mockTokenService,
        );
    });

    it('should register a new user and return a token pair', async () => {
        const tokenPair: TokenPair = {
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
        };

        mockCredentialRepository.findByEmail.mockResolvedValue(null);
        mockPasswordService.hash.mockResolvedValue('hashed_password');
        mockCredentialRepository.save.mockResolvedValue(
            new Credential('user-123', 'test@rideflow.com', 'hashed_password', AuthProvider.LOCAL, new Date()),
        );
        mockTokenService.generateTokenPair.mockReturnValue(tokenPair);

        const result = await useCase.execute({
            email: 'test@rideflow.com',
            password: 'SecurePass123',
        });

        expect(result).toEqual(tokenPair);
        expect(mockCredentialRepository.findByEmail).toHaveBeenCalledWith('test@rideflow.com');
        expect(mockPasswordService.hash).toHaveBeenCalledWith('SecurePass123');
        expect(mockCredentialRepository.save).toHaveBeenCalled();
        expect(mockTokenService.generateTokenPair).toHaveBeenCalled();
    });

    it('should throw EmailAlreadyExistsException if email is taken', async () => {
        mockCredentialRepository.findByEmail.mockResolvedValue(
            new Credential('user-123', 'test@rideflow.com', 'hashed_password', AuthProvider.LOCAL, new Date()),
        );

        await expect(
            useCase.execute({ email: 'test@rideflow.com', password: 'SecurePass123' }),
        ).rejects.toThrow(EmailAlreadyExistsException);

        expect(mockPasswordService.hash).not.toHaveBeenCalled();
        expect(mockCredentialRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error for an invalid email format', async () => {
        await expect(
            useCase.execute({ email: 'not-an-email', password: 'SecurePass123' }),
        ).rejects.toThrow();
    });
});