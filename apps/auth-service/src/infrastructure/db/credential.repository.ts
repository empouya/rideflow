import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ICredentialRepository } from '../../domain/repositories/credential.repository.interface';
import { Credential, AuthProvider } from '../../domain/entities/credential.entity';

@Injectable()
export class PrismaCredentialRepository implements ICredentialRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(credential: Credential): Promise<Credential> {
        const record = await this.prisma.credential.upsert({
            where: { userId: credential.userId },
            update: {
                email: credential.email,
                passwordHash: credential.passwordHash,
                provider: credential.provider,
            },
            create: {
                userId: credential.userId,
                email: credential.email,
                passwordHash: credential.passwordHash,
                provider: credential.provider,
            },
        });

        return new Credential(
            record.userId,
            record.email,
            record.passwordHash,
            record.provider as AuthProvider,
            record.createdAt,
        );
    }

    async findByEmail(email: string): Promise<Credential | null> {
        const record = await this.prisma.credential.findUnique({
            where: { email },
        });

        if (!record) return null;

        return new Credential(
            record.userId,
            record.email,
            record.passwordHash,
            record.provider as AuthProvider,
            record.createdAt,
        );
    }

    async findByUserId(userId: string): Promise<Credential | null> {
        const record = await this.prisma.credential.findUnique({
            where: { userId },
        });

        if (!record) return null;

        return new Credential(
            record.userId,
            record.email,
            record.passwordHash,
            record.provider as AuthProvider,
            record.createdAt,
        );
    }
}