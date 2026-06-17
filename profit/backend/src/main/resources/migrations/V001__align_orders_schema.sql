-- =====================================================
-- MIGRATION: Align orders table with JPA Entity
-- Chạy trước khi restart backend
-- Safe: KHÔNG DROP DATABASE, KHÔNG mất data
-- =====================================================

USE `ProFitSuppsDB`;

-- =====================================================
-- 1. RECREATE orders.status ENUM
-- MySQL không hỗ trợ ALTER ENUM, phải MODIFY column
-- =====================================================

ALTER TABLE `orders`
  MODIFY COLUMN `status`
    ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED')
    NOT NULL DEFAULT 'PENDING';

-- Migrate existing data: PAID → CONFIRMED, CANCELED → CANCELLED
UPDATE `orders` SET `status` = 'CONFIRMED' WHERE `status` = 'PAID';
UPDATE `orders` SET `status` = 'CANCELLED' WHERE `status` = 'CANCELED';

-- =====================================================
-- 2. RECREATE orders.payment_status ENUM
-- =====================================================

ALTER TABLE `orders`
  MODIFY COLUMN `payment_status`
    ENUM('UNPAID', 'PAID', 'PENDING_CONFIRM', 'FAILED', 'REFUNDED')
    NOT NULL DEFAULT 'UNPAID';

-- =====================================================
-- 3. Add missing columns if not exist
-- =====================================================

-- delivered_at
ALTER TABLE `orders`
  ADD COLUMN `delivered_at` DATETIME NULL
  AFTER `paid_at`;

-- completed_at
ALTER TABLE `orders`
  ADD COLUMN `completed_at` DATETIME NULL
  AFTER `delivered_at`;

-- payment_attempts
ALTER TABLE `orders`
  ADD COLUMN `payment_attempts` INT NOT NULL DEFAULT 0
  AFTER `canceled_at`;

-- bank_transfer_slip
ALTER TABLE `orders`
  ADD COLUMN `bank_transfer_slip` VARCHAR(500) NULL
  AFTER `payment_attempts`;

-- vnp_txn_ref
ALTER TABLE `orders`
  ADD COLUMN `vnp_txn_ref` VARCHAR(100) NULL
  AFTER `bank_transfer_slip`;

-- vnp_transaction_no
ALTER TABLE `orders`
  ADD COLUMN `vnp_transaction_no` VARCHAR(50) NULL
  AFTER `vnp_txn_ref`;

-- payment_method
ALTER TABLE `orders`
  ADD COLUMN `payment_method` VARCHAR(50) NULL
  AFTER `vnp_transaction_no`;

-- =====================================================
-- 4. Fix payments.status ENUM (CANCELED → CANCELLED)
-- =====================================================

ALTER TABLE `payments`
  MODIFY COLUMN `status`
    ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')
    NOT NULL DEFAULT 'PENDING';

UPDATE `payments` SET `status` = 'CANCELLED' WHERE `status` = 'CANCELED';

-- =====================================================
-- Done! Restart backend để Hibernate sync lại schema
-- =====================================================
