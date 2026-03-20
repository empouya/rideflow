import { Credential } from '../entities/credential.entity';

export interface ICredentialRepository {
    save(credential: Credential): Promise<Credential>;
    findByEmail(email: string): Promise<Credential | null>;
    findByUserId(userId: string): Promise<Credential | null>;
}

export const CREDENTIAL_REPOSITORY = Symbol('ICredentialRepository');