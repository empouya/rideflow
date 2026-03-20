import { Inject } from '@nestjs/common';
import {
    ITokenService,
    TOKEN_SERVICE,
    TokenPair,
} from '../ports/token.service.interface';

export interface RefreshTokenInput {
    refreshToken: string;
}

export class RefreshTokenUseCase {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenService,
    ) { }

    execute(input: RefreshTokenInput): TokenPair {
        const payload = this.tokenService.verifyRefreshToken(input.refreshToken);

        return this.tokenService.generateTokenPair({
            userId: payload.userId,
            email: payload.email,
        });
    }
}