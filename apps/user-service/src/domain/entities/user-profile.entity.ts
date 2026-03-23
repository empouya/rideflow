import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UserProfile {
    constructor(
        public readonly userId: string,
        public readonly name: string,
        public readonly role: UserRole,
        public readonly status: UserStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly phone?: string,
        public readonly avatarUrl?: string,
    ) { }

    static create(props: {
        userId: string;
        email: string;
        role?: UserRole;
        phone?: string;
        avatarUrl?: string;
    }): UserProfile {
        const name = props.email.split('@')[0];
        const now = new Date();

        return new UserProfile(
            props.userId,
            name,
            props.role ?? UserRole.PASSENGER,
            UserStatus.ACTIVE,
            now,
            now,
            props.phone,
            props.avatarUrl,
        );
    }

    update(props: {
        name?: string;
        phone?: string;
        avatarUrl?: string;
    }): UserProfile {
        return new UserProfile(
            this.userId,
            props.name ?? this.name,
            this.role,
            this.status,
            this.createdAt,
            new Date(),
            props.phone ?? this.phone,
            props.avatarUrl ?? this.avatarUrl,
        );
    }
}