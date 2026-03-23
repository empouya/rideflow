import { UserProfile } from '../entities/user-profile.entity';

export interface IUserProfileRepository {
    save(profile: UserProfile): Promise<UserProfile>;
    findById(userId: string): Promise<UserProfile | null>;
    update(profile: UserProfile): Promise<UserProfile>;
}

export const USER_PROFILE_REPOSITORY = Symbol('IUserProfileRepository');