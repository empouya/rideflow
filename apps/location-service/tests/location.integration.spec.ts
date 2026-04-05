import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/interfaces/filters/http-exception.filter';

const TEST_SECRET = 'location_test_access_secret';
const REDIS_KEY = 'locations:drivers';

function makeToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, TEST_SECRET, { expiresIn: '1h' });
}

describe('Location Integration Tests', () => {
    let app: INestApplication;
    let redis: Redis;

    beforeAll(async () => {
        process.env.JWT_ACCESS_SECRET = TEST_SECRET;
        process.env.REDIS_URL = 'redis://localhost:6379';
        process.env.KAFKA_BROKERS = 'localhost:9094';
        process.env.KAFKA_CLIENT_ID = 'rideflow-location-service-test';
        process.env.KAFKA_CONSUMER_GROUP_ID = 'location-service-test-group';

        redis = new Redis(process.env.REDIS_URL);

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
    });

    beforeEach(async () => {
        await redis.del(REDIS_KEY);
    });

    afterAll(async () => {
        await redis.del(REDIS_KEY);
        await redis.quit();
        await app.close();
    });

    it('should return 404 before a driver location exists', async () => {
        const token = makeToken('driver-001', 'driver1@rideflow.com');

        await request(app.getHttpServer())
            .get('/locations/drivers/driver-001')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    it('should update location and then return the driver location', async () => {
        const token = makeToken('driver-001', 'driver1@rideflow.com');

        await request(app.getHttpServer())
            .post('/locations/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                driverId: 'driver-001',
                latitude: 40.7128,
                longitude: -74.0060,
            })
            .expect(200);

        const response = await request(app.getHttpServer())
            .get('/locations/drivers/driver-001')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.driverId).toBe('driver-001');
        expect(response.body.latitude).toBeCloseTo(40.7128, 3);
        expect(response.body.longitude).toBeCloseTo(-74.0060, 3);
    });

    it('should return nearby drivers ordered by distance', async () => {
        const tokenA = makeToken('driver-a', 'drivera@rideflow.com');
        const tokenB = makeToken('driver-b', 'driverb@rideflow.com');

        await request(app.getHttpServer())
            .post('/locations/update')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                driverId: 'driver-a',
                latitude: 40.7128,
                longitude: -74.0060,
            })
            .expect(200);

        await request(app.getHttpServer())
            .post('/locations/update')
            .set('Authorization', `Bearer ${tokenB}`)
            .send({
                driverId: 'driver-b',
                latitude: 40.7306,
                longitude: -73.9352,
            })
            .expect(200);

        const response = await request(app.getHttpServer())
            .get('/locations/nearby')
            .set('Authorization', `Bearer ${tokenA}`)
            .query({
                latitude: 40.7128,
                longitude: -74.0060,
                radiusKm: 10,
                limit: 10,
            })
            .expect(200);

        expect(response.body.drivers.length).toBe(2);
        expect(response.body.drivers[0].driverId).toBe('driver-a');
        expect(response.body.drivers[1].driverId).toBe('driver-b');
    });
});
