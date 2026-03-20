import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Credential } from '../../domain/entities/credential.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { EmailAlreadyExistsException } from '../../domain/exceptions/auth.exceptions';
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

export interface RegisterInput {
    email: string;
    password: string;
}

export class RegisterUseCase {
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

    async execute(input: RegisterInput): Promise<TokenPair> {
        const email = Email.create(input.email);

        const existing = await this.credentialRepository.findByEmail(email.toString());
        if (existing) {
            logger.warn({ email: email.toString() }, 'Registration failed: email already exists');
            throw new EmailAlreadyExistsException(email.toString());
        }

        const passwordHash = await this.passwordService.hash(input.password);
        const userId = uuidv4();

        const credential = Credential.create({
            userId,
            email: email.toString(),
            passwordHash,
        });

        await this.credentialRepository.save(credential);

        await this.eventPublisher.publish({
            eventType: 'auth.user_registered',
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
            'User registered successfully',
        );

        return this.tokenService.generateTokenPair({
            userId: credential.userId,
            email: credential.email,
        });
    }
}