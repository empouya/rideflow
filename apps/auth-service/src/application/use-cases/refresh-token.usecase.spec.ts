import { RefreshTokenUseCase } from './refresh-token.usecase';
import { ITokenService, TokenPair } from '../ports/token.service.interface';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions';

const mockTokenService: jest.Mocked<ITokenService> = {
    generateTokenPair: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
};

describe('RefreshTokenUseCase', () => {
    let useCase: RefreshTokenUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new RefreshTokenUseCase(mockTokenService);
    });

    it('should return a new token pair for a valid refresh token', () => {
        const tokenPair: TokenPair = {
            accessToken: 'new_access_token',
            refreshToken: 'new_refresh_token',
        };

        mockTokenService.verifyRefreshToken.mockReturnValue({
            userId: 'user-123',
            email: 'test@rideflow.com',
        });
        mockTokenService.generateTokenPair.mockReturnValue(tokenPair);

        const result = useCase.execute({ refreshToken: 'valid_refresh_token' });

        expect(result).toEqual(tokenPair);
        expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
        expect(mockTokenService.generateTokenPair).toHaveBeenCalledWith({
            userId: 'user-123',
            email: 'test@rideflow.com',
        });
    });

    it('should throw InvalidTokenException for an invalid refresh token', () => {
        mockTokenService.verifyRefreshToken.mockImplementation(() => {
            throw new InvalidTokenException();
        });

        expect(() =>
            useCase.execute({ refreshToken: 'invalid_token' }),
        ).toThrow(InvalidTokenException);

        expect(mockTokenService.generateTokenPair).not.toHaveBeenCalled();
    });
});