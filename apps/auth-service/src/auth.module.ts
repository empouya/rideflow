import { Module } from '@nestjs/common';
import { CREDENTIAL_REPOSITORY } from './domain/repositories/credential.repository.interface';
import { PASSWORD_SERVICE } from './application/ports/password.service.interface';
import { TOKEN_SERVICE } from './application/ports/token.service.interface';
import { PrismaService } from './database/prisma.service';
import { PrismaCredentialRepository } from './infrastructure/db/credential.repository';
import { PasswordService } from './infrastructure/security/password.service';
import { TokenService } from './infrastructure/security/token.service';
import { RegisterUseCase } from './application/use-cases/register.usecase';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.usecase';

@Module({
    providers: [
        PrismaService,
        {
            provide: CREDENTIAL_REPOSITORY,
            useClass: PrismaCredentialRepository,
        },
        {
            provide: PASSWORD_SERVICE,
            useClass: PasswordService,
        },
        {
            provide: TOKEN_SERVICE,
            useClass: TokenService,
        },
        RegisterUseCase,
        LoginUseCase,
        RefreshTokenUseCase,
    ],
    exports: [
        CREDENTIAL_REPOSITORY,
        PASSWORD_SERVICE,
        TOKEN_SERVICE,
        PrismaService,
        RegisterUseCase,
        LoginUseCase,
        RefreshTokenUseCase,
    ],
})
export class AuthModule { }