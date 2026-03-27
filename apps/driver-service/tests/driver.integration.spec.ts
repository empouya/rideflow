import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { GlobalExceptionFilter } from '../src/interfaces/filters/http-exception.filter';

const TEST_SECRET = 'driver_test_access_secret';

function makeToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, TEST_SECRET, { expiresIn: '1h' });
}

describe('Driver Integration Tests', () => {
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
        await prisma.driverVehicle.deleteMany({
            where: { driverUserId: { in: ['drv-int-001', 'drv-int-002'] } },
        });
        await prisma.driver.deleteMany({
            where: { userId: { in: ['drv-int-001', 'drv-int-002'] } },
        });
        await app.close();
    });

    it('should provision a pending driver from a DRIVER profile event', async () => {
        await request(app.getHttpServer())
            .post('/dev/simulate/user.profile_created')
            .send({
                eventType: 'user.profile_created',
                payload: {
                    userId: 'drv-int-001',
                    name: 'Driver One',
                    role: 'DRIVER',
                    timestamp: new Date().toISOString(),
                },
                metadata: { version: '1.0', source: 'user-service' },
            })
            .expect(200);

        const token = makeToken('drv-int-001', 'driver1@rideflow.com');
        const response = await request(app.getHttpServer())
            .get('/drivers/drv-int-001')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.userId).toBe('drv-int-001');
        expect(response.body.onboardingStatus).toBe('PENDING');
        expect(response.body.status).toBe('OFFLINE');
    });

    it('should register and activate driver compliance details', async () => {
        const token = makeToken('drv-int-001', 'driver1@rideflow.com');

        const response = await request(app.getHttpServer())
            .post('/drivers/register')
            .set('Authorization', `Bearer ${token}`)
            .send({
                licenseNumber: 'dl-12345',
                licenseCountry: 'ES',
                licenseExpiresAt: '2030-01-01T00:00:00.000Z',
                vehicleMake: 'Toyota',
                vehicleModel: 'Prius',
                vehicleColor: 'Black',
                plateNumber: 'rf-1001',
                vehicleYear: new Date().getUTCFullYear(),
                seatCount: 4,
                vehicleCategory: 'STANDARD',
                inspectionExpiresAt: '2030-06-01T00:00:00.000Z',
            })
            .expect(201);

        expect(response.body.onboardingStatus).toBe('ACTIVE');
        expect(response.body.licenseNumber).toBe('DL-12345');
        expect(response.body.vehicle.plateNumber).toBe('RF-1001');
    });

    it('should allow an active driver to go online', async () => {
        const token = makeToken('drv-int-001', 'driver1@rideflow.com');

        const response = await request(app.getHttpServer())
            .patch('/drivers/drv-int-001/status')
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'ONLINE' })
            .expect(200);

        expect(response.body.status).toBe('ONLINE');
    });

    it('should reject access to another driver profile', async () => {
        await prisma.driver.create({
            data: {
                userId: 'drv-int-002',
                status: 'OFFLINE',
                onboardingStatus: 'PENDING',
            },
        });

        const token = makeToken('drv-int-001', 'driver1@rideflow.com');

        await request(app.getHttpServer())
            .get('/drivers/drv-int-002')
            .set('Authorization', `Bearer ${token}`)
            .expect(403);
    });
});
