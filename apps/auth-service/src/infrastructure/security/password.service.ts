import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordService } from '../../application/ports/password.service.interface';

@Injectable()
export class PasswordService implements IPasswordService {
    private readonly saltRounds = 12;

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}