-- CreateTable
CREATE TABLE "drivers" (
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "onboarding_status" TEXT NOT NULL DEFAULT 'PENDING',
    "license_number" TEXT,
    "license_country" TEXT,
    "license_expires_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "last_status_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "driver_vehicles" (
    "driver_user_id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'STANDARD',
    "seat_count" INTEGER NOT NULL DEFAULT 4,
    "inspection_expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_vehicles_pkey" PRIMARY KEY ("driver_user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "driver_vehicles_plate_number_key" ON "driver_vehicles"("plate_number");

-- AddForeignKey
ALTER TABLE "driver_vehicles" ADD CONSTRAINT "driver_vehicles_driver_user_id_fkey" FOREIGN KEY ("driver_user_id") REFERENCES "drivers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
