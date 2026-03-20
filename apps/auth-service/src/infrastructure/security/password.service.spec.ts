import { PasswordService } from './password.service';

describe('PasswordService', () => {
    let service: PasswordService;

    beforeEach(() => {
        service = new PasswordService();
    });

    it('should hash a password', async () => {
        const hash = await service.hash('MyPassword123');
        expect(hash).toBeDefined();
        expect(hash).not.toBe('MyPassword123');
        expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('should return true when comparing correct password', async () => {
        const hash = await service.hash('MyPassword123');
        const result = await service.compare('MyPassword123', hash);
        expect(result).toBe(true);
    });

    it('should return false when comparing wrong password', async () => {
        const hash = await service.hash('MyPassword123');
        const result = await service.compare('WrongPassword', hash);
        expect(result).toBe(false);
    });

    it('should generate different hashes for the same password', async () => {
        const hash1 = await service.hash('MyPassword123');
        const hash2 = await service.hash('MyPassword123');
        expect(hash1).not.toBe(hash2);
    });
});