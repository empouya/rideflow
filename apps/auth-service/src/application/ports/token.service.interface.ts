export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
}

export interface ITokenService {
    generateTokenPair(payload: TokenPayload): TokenPair;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
}

export const TOKEN_SERVICE = Symbol('ITokenService');