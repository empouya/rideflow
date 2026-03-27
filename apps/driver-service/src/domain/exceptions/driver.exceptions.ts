export class DriverNotFoundException extends Error {
    constructor(userId: string) {
        super(`Driver not found: ${userId}`);
        this.name = 'DriverNotFoundException';
    }
}

export class DriverAlreadyExistsException extends Error {
    constructor(userId: string) {
        super(`Driver already registered: ${userId}`);
        this.name = 'DriverAlreadyExistsException';
    }
}

export class DriverEligibilityException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DriverEligibilityException';
    }
}

export class DriverComplianceConflictException extends Error {
    constructor(field: 'licenseNumber' | 'plateNumber', value: string) {
        super(`Driver ${field} already exists: ${value}`);
        this.name = 'DriverComplianceConflictException';
    }
}
