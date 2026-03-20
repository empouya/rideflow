import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.usecase';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { TokenPair } from '../../application/ports/token.service.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
    ) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto): Promise<TokenPair> {
        return this.registerUseCase.execute({
            email: dto.email,
            password: dto.password,
        });
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto): Promise<TokenPair> {
        return this.loginUseCase.execute({
            email: dto.email,
            password: dto.password,
        });
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPair> {
        return this.refreshTokenUseCase.execute({
            refreshToken: dto.refreshToken,
        });
    }
}