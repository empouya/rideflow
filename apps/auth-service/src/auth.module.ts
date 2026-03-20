import { Module } from '@nestjs/common';
import { CREDENTIAL_REPOSITORY } from './domain/repositories/credential.repository.interface';
import { PrismaService } from './database/prisma.service';
import { PrismaCredentialRepository } from './infrastructure/db/credential.repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: CREDENTIAL_REPOSITORY,
            useClass: PrismaCredentialRepository,
        },
    ],
    exports: [CREDENTIAL_REPOSITORY, PrismaService],
})
export class AuthModule { }