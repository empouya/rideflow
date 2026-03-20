import { Inject } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import { InvalidCredentialsException } from '../../domain/exceptions/auth.exceptions';
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
import {
    IEventPublisher,
    EVENT_PUBLISHER,
} from '../../events/publishers/event-publisher.interface';
import { logger } from '../../common/logger/logger.service';

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
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    async execute(input: LoginInput): Promise<TokenPair> {
        const email = Email.create(input.email);

        const credential = await this.credentialRepository.findByEmail(email.toString());
        if (!credential) {
            logger.warn({ email: email.toString() }, 'Login failed: user not found');
            throw new InvalidCredentialsException();
        }

        const isValid = await this.passwordService.compare(
            input.password,
            credential.passwordHash,
        );
        if (!isValid) {
            logger.warn({ email: email.toString() }, 'Login failed: invalid password');
            throw new InvalidCredentialsException();
        }

        await this.eventPublisher.publish({
            eventType: 'auth.user_logged_in',
            payload: {
                userId: credential.userId,
                email: credential.email,
                timestamp: new Date().toISOString(),
            },
            metadata: {
                version: '1.0',
                source: 'auth-service',
            },
        });

        logger.info(
            { userId: credential.userId, email: credential.email },
            'User logged in successfully',
        );

        return this.tokenService.generateTokenPair({
            userId: credential.userId,
            email: credential.email,
        });
    }
}