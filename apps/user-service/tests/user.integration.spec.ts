import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/interfaces/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';
import * as jwt from 'jsonwebtoken';

const TEST_SECRET = 'test_access_secret';

function makeToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, TEST_SECRET, { expiresIn: '1h' });
}

describe('User Integration Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        process.env.JWT_ACCESS_SECRET = TEST_SECRET;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        app.useGlobalFilters(new GlobalExceptionFilter());

        await app.init();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await prisma.userProfile.deleteMany({
            where: { userId: { in: ['int-user-001', 'int-user-002', 'int-user-003'] } },
        });
        await app.close();
    });

    describe('POST /dev/simulate/auth.user_registered', () => {
        it('should create a user profile from event', async () => {
            const response = await request(app.getHttpServer())
                .post('/dev/simulate/auth.user_registered')
                .send({
                    eventType: 'auth.user_registered',
                    payload: {
                        userId: 'int-user-001',
                        email: 'inttest@rideflow.com',
                        timestamp: new Date().toISOString(),
                    },
                    metadata: { version: '1.0', source: 'auth-service' },
                })
                .expect(200);

            expect(response.body.message).toBe('Event simulated successfully');
        });

        it('should return 409 if profile already exists', async () => {
            await request(app.getHttpServer())
                .post('/dev/simulate/auth.user_registered')
                .send({
                    eventType: 'auth.user_registered',
                    payload: {
                        userId: 'int-user-002',
                        email: 'duplicate@rideflow.com',
                        timestamp: new Date().toISOString(),
                    },
                    metadata: { version: '1.0', source: 'auth-service' },
                })
                .expect(200);

            await request(app.getHttpServer())
                .post('/dev/simulate/auth.user_registered')
                .send({
                    eventType: 'auth.user_registered',
                    payload: {
                        userId: 'int-user-002',
                        email: 'duplicate@rideflow.com',
                        timestamp: new Date().toISOString(),
                    },
                    metadata: { version: '1.0', source: 'auth-service' },
                })
                .expect(409);
        });
    });

    describe('GET /users/:id', () => {
        beforeAll(async () => {
            await request(app.getHttpServer())
                .post('/dev/simulate/auth.user_registered')
                .send({
                    eventType: 'auth.user_registered',
                    payload: {
                        userId: 'int-user-003',
                        email: 'gettest@rideflow.com',
                        timestamp: new Date().toISOString(),
                    },
                    metadata: { version: '1.0', source: 'auth-service' },
                });
        });

        it('should return a user profile with valid token', async () => {
            const token = makeToken('int-user-003', 'gettest@rideflow.com');

            const response = await request(app.getHttpServer())
                .get('/users/int-user-003')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.userId).toBe('int-user-003');
            expect(response.body.name).toBe('gettest');
            expect(response.body.role).toBe('PASSENGER');
            expect(response.body.status).toBe('ACTIVE');
        });

        it('should return 401 without token', async () => {
            await request(app.getHttpServer())
                .get('/users/int-user-003')
                .expect(401);
        });

        it('should return 404 for non-existent user', async () => {
            const token = makeToken('int-user-003', 'gettest@rideflow.com');

            await request(app.getHttpServer())
                .get('/users/ghost-999')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    describe('PATCH /users/:id', () => {
        it('should update own profile', async () => {
            const token = makeToken('int-user-003', 'gettest@rideflow.com');

            const response = await request(app.getHttpServer())
                .patch('/users/int-user-003')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name', phone: '+1234567890' })
                .expect(200);

            expect(response.body.name).toBe('Updated Name');
        });

        it('should return 403 when updating another user profile', async () => {
            const token = makeToken('int-user-003', 'gettest@rideflow.com');

            await request(app.getHttpServer())
                .patch('/users/someone-else')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Hacker' })
                .expect(403);
        });

        it('should return 400 for invalid dto', async () => {
            const token = makeToken('int-user-003', 'gettest@rideflow.com');

            await request(app.getHttpServer())
                .patch('/users/int-user-003')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'X', unknownField: 'bad' })
                .expect(400);
        });
    });
});