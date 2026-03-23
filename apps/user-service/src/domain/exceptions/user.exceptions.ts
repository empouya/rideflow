export class UserNotFoundException extends Error {
    constructor(userId: string) {
        super(`User not found: ${userId}`);
        this.name = 'UserNotFoundException';
    }
}

export class UserAlreadyExistsException extends Error {
    constructor(userId: string) {
        super(`User already exists: ${userId}`);
        this.name = 'UserAlreadyExistsException';
    }
}