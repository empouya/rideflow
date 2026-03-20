export class Credential {
    constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly passwordHash: string,
        public readonly provider: AuthProvider,
        public readonly createdAt: Date,
    ) { }

    static create(props: {
        userId: string;
        email: string;
        passwordHash: string;
        provider?: AuthProvider;
    }): Credential {
        return new Credential(
            props.userId,
            props.email,
            props.passwordHash,
            props.provider ?? AuthProvider.LOCAL,
            new Date(),
        );
    }
}

export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
}