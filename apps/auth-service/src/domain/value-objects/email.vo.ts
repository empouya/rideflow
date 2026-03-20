export class Email {
    private readonly value: string;

    private constructor(value: string) {
        this.value = value.toLowerCase().trim();
    }

    static create(raw: string): Email {
        if (!raw || !Email.isValid(raw)) {
            throw new Error(`Invalid email address: ${raw}`);
        }
        return new Email(raw);
    }

    private static isValid(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    toString(): string {
        return this.value;
    }
}