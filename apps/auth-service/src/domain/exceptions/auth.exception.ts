export class EmailAlreadyExistsException extends Error {
    constructor(email: string) {
        super(`Email already exists: ${email}`);
        this.name = 'EmailAlreadyExistsException';
    }
}

export class InvalidCredentialsException extends Error {
    constructor() {
        super('Invalid email or password');
        this.name = 'InvalidCredentialsException';
    }
}

export class InvalidTokenException extends Error {
    constructor() {
        super('Invalid or expired token');
        this.name = 'InvalidTokenException';
    }
}