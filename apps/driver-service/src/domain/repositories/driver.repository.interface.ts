import { Driver } from '../entities/driver.entity';

export interface IDriverRepository {
    save(driver: Driver): Promise<Driver>;
    update(driver: Driver): Promise<Driver>;
    findById(userId: string): Promise<Driver | null>;
    findByLicenseNumber(licenseNumber: string): Promise<Driver | null>;
    findByPlateNumber(plateNumber: string): Promise<Driver | null>;
}

export const DRIVER_REPOSITORY = Symbol('IDriverRepository');
