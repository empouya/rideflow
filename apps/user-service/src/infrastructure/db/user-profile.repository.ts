import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    IUserProfileRepository,
} from '../../domain/repositories/user-profile.repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';

@Injectable()
export class PrismaUserProfileRepository implements IUserProfileRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(profile: UserProfile): Promise<UserProfile> {
        const record = await this.prisma.userProfile.create({
            data: {
                userId: profile.userId,
                name: profile.name,
                role: profile.role,
                status: profile.status,
                phone: profile.phone,
                avatarUrl: profile.avatarUrl,
            },
        });

        return this.toEntity(record);
    }

    async findById(userId: string): Promise<UserProfile | null> {
        const record = await this.prisma.userProfile.findUnique({
            where: { userId },
        });

        if (!record) return null;

        return this.toEntity(record);
    }

    async update(profile: UserProfile): Promise<UserProfile> {
        const record = await this.prisma.userProfile.update({
            where: { userId: profile.userId },
            data: {
                name: profile.name,
                phone: profile.phone,
                avatarUrl: profile.avatarUrl,
                updatedAt: profile.updatedAt,
            },
        });

        return this.toEntity(record);
    }

    private toEntity(record: {
        userId: string;
        name: string;
        role: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        avatarUrl: string | null;
    }): UserProfile {
        return new UserProfile(
            record.userId,
            record.name,
            record.role as UserRole,
            record.status as UserStatus,
            record.createdAt,
            record.updatedAt,
            record.phone ?? undefined,
            record.avatarUrl ?? undefined,
        );
    }
}