import { LoginUseCase } from './login.usecase';
import { ICredentialRepository } from '../../domain/repositories/credential.repository.interface';
import { IPasswordService } from '../ports/password.service.interface';
import { ITokenService, TokenPair } from '../ports/token.service.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/auth.exceptions';
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

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new LoginUseCase(
            mockCredentialRepository,
            mockPasswordService,
            mockTokenService,
        );
    });

    it('should login successfully and return a token pair', async () => {
        const tokenPair: TokenPair = {
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
        };

        mockCredentialRepository.findByEmail.mockResolvedValue(
            new Credential('user-123', 'test@rideflow.com', 'hashed_password', AuthProvider.LOCAL, new Date()),
        );
        mockPasswordService.compare.mockResolvedValue(true);
        mockTokenService.generateTokenPair.mockReturnValue(tokenPair);

        const result = await useCase.execute({
            email: 'test@rideflow.com',
            password: 'SecurePass123',
        });

        expect(result).toEqual(tokenPair);
        expect(mockCredentialRepository.findByEmail).toHaveBeenCalledWith('test@rideflow.com');
        expect(mockPasswordService.compare).toHaveBeenCalledWith('SecurePass123', 'hashed_password');
        expect(mockTokenService.generateTokenPair).toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when user is not found', async () => {
        mockCredentialRepository.findByEmail.mockResolvedValue(null);

        await expect(
            useCase.execute({ email: 'ghost@rideflow.com', password: 'SecurePass123' }),
        ).rejects.toThrow(InvalidCredentialsException);

        expect(mockPasswordService.compare).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when password is wrong', async () => {
        mockCredentialRepository.findByEmail.mockResolvedValue(
            new Credential('user-123', 'test@rideflow.com', 'hashed_password', AuthProvider.LOCAL, new Date()),
        );
        mockPasswordService.compare.mockResolvedValue(false);

        await expect(
            useCase.execute({ email: 'test@rideflow.com', password: 'WrongPassword' }),
        ).rejects.toThrow(InvalidCredentialsException);

        expect(mockTokenService.generateTokenPair).not.toHaveBeenCalled();
    });
});