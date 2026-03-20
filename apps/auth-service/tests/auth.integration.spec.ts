import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/interfaces/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';

describe('Auth Integration Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
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
        await prisma.credential.deleteMany({
            where: { email: { contains: '@integration-test.com' } },
        });
        await app.close();
    });

    describe('POST /auth/register', () => {
        it('should register a new user and return tokens', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'newuser@integration-test.com', password: 'SecurePass123' })
                .expect(201);

            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });

        it('should return 409 when email already exists', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'duplicate@integration-test.com', password: 'SecurePass123' });

            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'duplicate@integration-test.com', password: 'SecurePass123' })
                .expect(409);
        });

        it('should return 400 for invalid email', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'not-an-email', password: 'SecurePass123' })
                .expect(400);
        });

        it('should return 400 for short password', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'valid@integration-test.com', password: '123' })
                .expect(400);
        });
    });

    describe('POST /auth/login', () => {
        beforeAll(async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'login@integration-test.com', password: 'SecurePass123' });
        });

        it('should login and return tokens', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'login@integration-test.com', password: 'SecurePass123' })
                .expect(200);

            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });

        it('should return 401 for wrong password', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'login@integration-test.com', password: 'WrongPassword' })
                .expect(401);
        });

        it('should return 401 for non-existent email', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'ghost@integration-test.com', password: 'SecurePass123' })
                .expect(401);
        });
    });

    describe('POST /auth/refresh', () => {
        let refreshToken: string;

        beforeAll(async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'refresh@integration-test.com', password: 'SecurePass123' });

            refreshToken = response.body.refreshToken;
        });

        it('should return a new token pair for a valid refresh token', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });

        it('should return 401 for an invalid refresh token', async () => {
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid.token.here' })
                .expect(401);
        });
    });
});