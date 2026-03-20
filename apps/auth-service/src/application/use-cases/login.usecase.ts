import { Inject } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import {
    InvalidCredentialsException,
} from '../../domain/exceptions/auth.exceptions';
import {
    ICredentialRepository,
    CREDENTIAL_REPOSITORY,
} from '../../domain/repositories/credential.repository.interface';
import {
    IPasswordService,
    PASSWORD_SERVICE,
} from '../ports/password.service.interface';
import {
    ITokenService,
    TOKEN_SERVICE,
    TokenPair,
} from '../ports/token.service.interface';

export interface LoginInput {
    email: string;
    password: string;
}

export class LoginUseCase {
    constructor(
        @Inject(CREDENTIAL_REPOSITORY)
        private readonly credentialRepository: ICredentialRepository,
        @Inject(PASSWORD_SERVICE)
        private readonly passwordService: IPasswordService,
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenService,
    ) { }

    async execute(input: LoginInput): Promise<TokenPair> {
        const email = Email.create(input.email);

        const credential = await this.credentialRepository.findByEmail(email.toString());
        if (!credential) {
            throw new InvalidCredentialsException();
        }

        const isValid = await this.passwordService.compare(
            input.password,
            credential.passwordHash,
        );
        if (!isValid) {
            throw new InvalidCredentialsException();
        }

        return this.tokenService.generateTokenPair({
            userId: credential.userId,
            email: credential.email,
        });
    }
}