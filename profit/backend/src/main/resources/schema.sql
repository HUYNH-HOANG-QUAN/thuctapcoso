 -- =====================================================
-- ProFitSuppsDB - FULL SCHEMA + PRODUCT DATA + TRIGGERS
-- =====================================================

SET NAMES utf8mb4;
DROP DATABASE IF EXISTS `ProFitSuppsDB`;
CREATE DATABASE `ProFitSuppsDB` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ProFitSuppsDB`;

-- =====================================================
-- PHẦN 1: SCHEMA
-- =====================================================

CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `email_verified_at` DATETIME NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    UNIQUE KEY `uk_users_phone` (`phone`),
    KEY `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_addresses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `type` ENUM('SHIPPING', 'BILLING') NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address_line1` VARCHAR(255) NOT NULL,
    `address_line2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
    `postal_code` VARCHAR(20) NULL,
    `is_default` TINYINT(1) NOT NULL DEFAULT 0,
    `deleted_at` DATETIME NULL,
    `default_user_guard` BIGINT GENERATED ALWAYS AS (
        CASE WHEN `is_default` = 1 AND `deleted_at` IS NULL THEN `user_id` ELSE NULL END
    ) STORED,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_addresses_default_one_per_user` (`default_user_guard`),
    UNIQUE KEY `uk_user_addresses_id_user` (`id`, `user_id`),
    KEY `idx_user_addresses_user` (`user_id`, `type`, `deleted_at`),
    CONSTRAINT `fk_addr_user`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_methods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `payment_type` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'CASH_ON_DELIVERY') NOT NULL,
    `provider` VARCHAR(50) NULL,
    `account_name` VARCHAR(100) NULL,
    `last_4_digits` VARCHAR(4) NULL,
    `token_ref` VARCHAR(255) NULL,
    `is_default` TINYINT(1) NOT NULL DEFAULT 0,
    `deleted_at` DATETIME NULL,
    `default_user_guard` BIGINT GENERATED ALWAYS AS (
        CASE WHEN `is_default` = 1 AND `deleted_at` IS NULL THEN `user_id` ELSE NULL END
    ) STORED,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payment_methods_default_one_per_user` (`default_user_guard`),
    UNIQUE KEY `uk_payment_methods_id_user` (`id`, `user_id`),
    KEY `idx_payment_methods_user` (`user_id`, `payment_type`, `deleted_at`),
    CONSTRAINT `fk_pm_user`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_categories_slug` (`slug`),
    KEY `idx_categories_parent` (`parent_id`),
    CONSTRAINT `fk_categories_parent`
        FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT NULL,
    `sku` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `short_description` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `price` DECIMAL(15,2) NOT NULL,
    `old_price` DECIMAL(15,2) NULL,
    `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    `rating_count` INT NOT NULL DEFAULT 0,
    `stock_quantity` INT NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_products_sku` (`sku`),
    UNIQUE KEY `uk_products_slug` (`slug`),
    KEY `idx_products_category_active` (`category_id`, `is_active`, `deleted_at`),
    CONSTRAINT `chk_products_stock_quantity` CHECK (`stock_quantity` >= 0),
    CONSTRAINT `chk_products_price_non_negative` CHECK (`price` >= 0),
    CONSTRAINT `chk_products_old_price_non_negative` CHECK (`old_price` IS NULL OR `old_price` >= 0),
    CONSTRAINT `fk_product_category`
        FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `primary_product_guard` BIGINT GENERATED ALWAYS AS (
        CASE WHEN `is_primary` = 1 THEN `product_id` ELSE NULL END
    ) STORED,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_product_images_primary_one_per_product` (`primary_product_guard`),
    KEY `idx_product_images_product` (`product_id`, `sort_order`),
    CONSTRAINT `fk_image_product`
        FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_tags` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_product_tags_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_tag_map` (
    `product_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    PRIMARY KEY (`product_id`, `tag_id`),
    KEY `idx_product_tag_map_tag` (`tag_id`),
    CONSTRAINT `fk_map_product`
        FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT `fk_map_tag`
        FOREIGN KEY (`tag_id`) REFERENCES `product_tags`(`id`)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `discount_codes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `discount_type` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    `discount_value` DECIMAL(15,2) NOT NULL,
    `min_order_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `max_discount_amount` DECIMAL(15,2) NULL,
    `per_user_limit` INT NULL,
    `global_limit` INT NULL,
    `used_count` INT NOT NULL DEFAULT 0,
    `start_at` DATETIME NULL,
    `end_at` DATETIME NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_discount_codes_code` (`code`),
    CONSTRAINT `chk_discount_codes_value_non_negative` CHECK (`discount_value` >= 0),
    CONSTRAINT `chk_discount_codes_used_count_non_negative` CHECK (`used_count` >= 0),
    CONSTRAINT `chk_discount_codes_limits_valid` CHECK (`per_user_limit` IS NULL OR `per_user_limit` > 0),
    CONSTRAINT `chk_discount_codes_global_limit_valid` CHECK (`global_limit` IS NULL OR `global_limit` > 0),
    CONSTRAINT `chk_discount_codes_dates_valid` CHECK (`end_at` IS NULL OR `start_at` IS NULL OR `end_at` >= `start_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shipping_methods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `fee` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_shipping_methods_code` (`code`),
    CONSTRAINT `chk_shipping_methods_fee_non_negative` CHECK (`fee` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `order_code` VARCHAR(50) NOT NULL,
    `shipping_address_id` BIGINT NULL,
    `payment_method_id` BIGINT NULL,
    `shipping_method_id` BIGINT NULL,
    `discount_code_id` BIGINT NULL,
    `recipient_name` VARCHAR(100) NOT NULL,
    `recipient_phone` VARCHAR(20) NOT NULL,
    `shipping_address_line1` VARCHAR(255) NOT NULL,
    `shipping_address_line2` VARCHAR(255) NULL,
    `shipping_city` VARCHAR(100) NOT NULL,
    `shipping_province` VARCHAR(100) NOT NULL,
    `shipping_country` VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
    `shipping_postal_code` VARCHAR(20) NULL,
    `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `shipping_fee` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `payment_status` ENUM('UNPAID', 'PAID', 'PENDING_CONFIRM', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `note` VARCHAR(500) NULL,
    `placed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `paid_at` DATETIME NULL,
    `delivered_at` DATETIME NULL,
    `completed_at` DATETIME NULL,
    `canceled_at` DATETIME NULL,
    `payment_attempts` INT NOT NULL DEFAULT 0,
    `bank_transfer_slip` VARCHAR(500) NULL,
    `vnp_txn_ref` VARCHAR(100) NULL,
    `vnp_transaction_no` VARCHAR(50) NULL,
    `payment_method` VARCHAR(50) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_orders_order_code` (`order_code`),
    KEY `idx_orders_user_status_created` (`user_id`, `status`, `created_at`),
    KEY `idx_orders_discount_code` (`discount_code_id`),
    CONSTRAINT `chk_orders_money_non_negative` CHECK (`subtotal` >= 0 AND `discount_amount` >= 0 AND `shipping_fee` >= 0 AND `total_amount` >= 0),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_order_addr_owner` FOREIGN KEY (`shipping_address_id`, `user_id`) REFERENCES `user_addresses`(`id`, `user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_order_pm_owner` FOREIGN KEY (`payment_method_id`, `user_id`) REFERENCES `payment_methods`(`id`, `user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_order_sm` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT `fk_order_dc` FOREIGN KEY (`discount_code_id`) REFERENCES `discount_codes`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `product_name` VARCHAR(200) NOT NULL,
    `product_sku` VARCHAR(50) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(15,2) NOT NULL,
    `line_total` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_items_order_product` (`order_id`, `product_id`),
    KEY `idx_order_items_product` (`product_id`),
    CONSTRAINT `chk_order_items_quantity` CHECK (`quantity` > 0),
    CONSTRAINT `chk_order_items_unit_price_non_negative` CHECK (`unit_price` >= 0),
    CONSTRAINT `chk_order_items_line_total_non_negative` CHECK (`line_total` >= 0),
    CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `discount_usages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `discount_code_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `order_id` BIGINT NOT NULL,
    `used_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_discount_usages_order_once` (`order_id`),
    KEY `idx_discount_usages_code_user` (`discount_code_id`, `user_id`),
    CONSTRAINT `fk_du_code` FOREIGN KEY (`discount_code_id`) REFERENCES `discount_codes`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_du_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_du_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_status_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `old_status` VARCHAR(20) NULL,
    `new_status` VARCHAR(20) NOT NULL,
    `changed_note` VARCHAR(255) NULL,
    `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_order_status_history_order` (`order_id`, `changed_at`),
    CONSTRAINT `fk_osh_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `provider` VARCHAR(50) NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `transaction_code` VARCHAR(100) NULL,
    `amount` DECIMAL(15,2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'VND',
    `status` ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paid_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_payments_transaction_code` (`transaction_code`),
    KEY `idx_payments_order_status` (`order_id`, `status`),
    CONSTRAINT `chk_payments_amount_non_negative` CHECK (`amount` >= 0),
    CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stock_movements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `quantity` INT NOT NULL,
    `reason` ENUM('ORDER', 'RETURN', 'ADJUSTMENT', 'PURCHASE', 'DAMAGED') NOT NULL,
    `reference_type` ENUM('ORDER', 'RETURN', 'MANUAL', 'PURCHASE') NULL,
    `reference_id` BIGINT NULL,
    `note` VARCHAR(255) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_stock_movements_product_created` (`product_id`, `created_at`),
    CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `rating` INT NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uc_user_product` (`user_id`, `product_id`),
    KEY `idx_reviews_product` (`product_id`, `created_at`),
    CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
    CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHẦN 2: DỮ LIỆU MẪU
-- =====================================================

INSERT INTO `categories` (`id`, `name`, `slug`, `is_active`) VALUES
(1, 'Whey Protein', 'whey-protein', 1),
(2, 'Pre-Workout', 'pre-workout', 1),
(3, 'Protein Bars & Cookies', 'protein-bars-cookies', 1),
(4, 'Creatine', 'creatine', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug);

INSERT INTO `product_tags` (`id`, `code`, `display_name`) VALUES 
(1, 'best-seller', 'Best Seller'),
(2, 'new-arrival', 'New Arrival'),
(3, 'on-sale', 'On Sale'),
(4, 'hot-deal', 'Hot Deal'),
(5, 'popular', 'Popular')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO `products`
  (`id`, `category_id`, `sku`, `slug`, `name`,
   `short_description`, `description`,
   `price`, `old_price`, `rating_avg`, `rating_count`,
   `stock_quantity`, `is_active`, `deleted_at`, `created_at`, `updated_at`)
VALUES
-- ─── WHEY PROTEIN (category_id = 1, ID 1–21) ────────────────────────────────
(1, 1, 'PTS-W01', 'on-gold-standard-100-whey-5lbs', 'Optimum Nutrition Gold Standard 100% Whey 5lbs', '24g Protein tăng cơ, phục hồi hiệu quả cơ bắp', 'Gold Standard 100% Whey™ là tiêu chuẩn vàng về chất lượng protein với 24g đạm mỗi lần dùng. Thành phần chính là Whey Protein Isolate giúp hấp thụ nhanh sau tập.', 1650000.00, 1850000.00, 4.8, 1240, 50, 1, NULL, NOW(), NOW()),
(2, 1, 'PTS-W02', 'rule-1-protein-isolate-5lbs', 'Rule 1 Protein Isolate 5lbs', '100% Pure Whey Isolate & Hydrolyzed siêu hấp thụ', 'Rule 1 Protein sử dụng 100% whey isolate và hydrolyzed, không có tạp chất. Mỗi serving cung cấp 25g protein tinh sạch với hàm lượng đường gần như bằng 0.', 1550000.00, 1750000.00, 4.7, 890, 50, 1, NULL, NOW(), NOW()),
(3, 1, 'PTS-W03', 'dymatize-iso100-hydrolyzed-5lbs', 'Dymatize ISO 100 Hydrolyzed 5lbs', 'Whey hydrolyzed cao cấp nhất cho vận động viên chuyên nghiệp', 'ISO 100 của Dymatize là sản phẩm whey hydrolyzed hàng đầu thế giới. Quá trình thủy phân cắt giảm phân tử đạm xuống mức vi mô giúp hấp thu gần như tức thì sau tập.', 2250000.00, 2450000.00, 4.9, 1560, 50, 1, NULL, NOW(), NOW()),
(4, 1, 'PTS-W04', 'muscletech-nitrotech-whey-gold-5lbs', 'Muscletech NitroTech Whey Gold 5lbs', 'Công thức Whey Peptides cao cấp, hỗ trợ phát triển nạc cơ tối đa', 'NitroTech Whey Gold bổ sung 2.5g Creatine và 5.5g BCAA trong mỗi serving, giúp tối ưu hóa tổng hợp protein và hồi phục cơ bắp sau tập luyện cường độ cao.', 1450000.00, 1650000.00, 4.6, 720, 50, 1, NULL, NOW(), NOW()),
(5, 1, 'PTS-W05', 'nutrabolics-hydropure-4-5lbs', 'Nutrabolics Hydropure 100 Hydrolyzed Whey 4.5lbs', '28g Đạm thủy phân cao cấp tinh khiết nhất', 'Hydropure sử dụng công nghệ lọc lạnh vi mô (CFM) độc quyền kết hợp thủy phân bậc cao, tạo ra nguồn đạm 28g/serving tinh khiết tuyệt đối, gần như 0% lactose.', 2550000.00, 3090000.00, 4.7, 430, 50, 1, NULL, NOW(), NOW()),
(6, 1, 'PTS-W06', 'mutant-iso-surge-5lbs', 'Mutant Iso Surge 5lbs', 'Whey cô lập cao cấp với hệ thống hương vị thơm ngon xuất sắc', 'Mutant Iso Surge cung cấp 25g whey isolate tinh khiết mỗi serving với hương vị phong phú, không gây đầy bụng hay khó tiêu. Phù hợp cả người mới lẫn gymer lâu năm.', 1750000.00, 1950000.00, 4.5, 380, 50, 1, NULL, NOW(), NOW()),
(7, 1, 'PTS-W07', 'allmax-isoflex-5lbs', 'Allmax Isoflex Whey Isolate 5lbs', 'Công nghệ lọc lạnh CFM độc quyền tạo ra nguồn đạm siêu sạch', 'Isoflex dùng công nghệ lọc trạng thái rắn độc quyền (SSF) loại bỏ hoàn toàn lactose, fat, và tạp chất. Kết quả: 27g protein tinh khiết 99% mỗi serving.', 1950000.00, 2150000.00, 4.6, 510, 50, 1, NULL, NOW(), NOW()),
(8, 1, 'PTS-W08', 'myprotein-impact-whey-isolate-1kg', 'MyProtein Impact Whey Isolate 1kg', 'Tỷ lệ protein tinh sạch cao đạt 90%, không trans-fat', 'Impact Whey Isolate của MyProtein đạt tỷ lệ protein 90%, cực kỳ ít carbs và fat. Sản xuất tại Anh theo chuẩn GMP, có rất nhiều hương vị đa dạng.', 850000.00, 990000.00, 4.4, 2100, 50, 1, NULL, NOW(), NOW()),
(9, 1, 'PTS-W09', 'vpx-vp2-whey-isolate-2lbs', 'VPX VP2 Whey Isolate 2lbs', 'Nghiên cứu khoa học cô lập vi mô phát triển sợi cơ nhanh', 'VP2 Whey Isolate của VPX được phát triển dựa trên nghiên cứu khoa học về cô lập protein vi mô, cung cấp 22g đạm tinh khiết và các chuỗi peptide sinh học tối ưu.', 920000.00, 1050000.00, 4.3, 290, 50, 1, NULL, NOW(), NOW()),
(10, 1, 'PTS-W10', 'bpi-sports-iso-hd-5lbs', 'BPI Sports ISO HD 5lbs', 'Cung cấp hàm lượng axit amin thiết yếu EAA dồi dào', 'ISO HD cung cấp 25g whey isolate mỗi serving cùng profile EAA đầy đủ. Công thức ít carb phù hợp cho người đang trong giai đoạn siết nạc.', 1390000.00, 1550000.00, 4.4, 450, 50, 1, NULL, NOW(), NOW()),
(11, 1, 'PTS-W11', 'musclepharm-combat-whey-5lbs', 'MusclePharm Combat 100% Whey 5lbs', 'Hỗn hợp đạm hấp thu đa tầng giải phóng liên tục bảo vệ cơ bắp', 'Combat 100% Whey kết hợp whey concentrate, isolate và hydrolyzed giải phóng đạm liên tục 4-6 giờ. Bổ sung enzyme tiêu hóa hỗ trợ hấp thu tối đa.', 1420000.00, 1620000.00, 4.5, 680, 50, 1, NULL, NOW(), NOW()),
(12, 1, 'PTS-W12', 'jym-pro-jym-protein-4lbs', 'JYM Supplement Science Pro-JYM 4lbs', 'Tỷ lệ đạm vàng kết hợp giữa Whey, Casein và trứng', 'Pro-JYM do Dr. Jim Stoppani thiết kế với tỷ lệ vàng 4:1:1 giữa Whey Isolate, Micellar Casein và Egg White Protein. Cung cấp đạm đa tầng tối ưu suốt cả ngày.', 1590000.00, 1790000.00, 4.6, 320, 50, 1, NULL, NOW(), NOW()),
(13, 1, 'PTS-W13', 'bsn-syntha-6-protein-5lbs', 'BSN Syntha-6 Protein 5lbs', 'Bữa ăn giàu đạm thay thế tối ưu nuôi dưỡng cơ bắp ban đêm', 'Syntha-6 là matrix protein đa tầng với 6 loại đạm bổ sung nhau: Whey Concentrate, Isolate, Casein, Calcium Caseinate, Egg Albumin, và Glutamine Peptides.', 1350000.00, 1550000.00, 4.5, 890, 50, 1, NULL, NOW(), NOW()),
(14, 1, 'PTS-W14', 'myotein-premium-protein-4lbs', 'Xendurance Myotein Premium 4lbs', 'Nguồn cung cấp chuỗi peptide sinh học hồi phục cơ chuyên sâu', 'Myotein kết hợp whey isolate và concentrate với phức hợp enzyme DigeZyme® giúp phân giải và hấp thụ protein nhanh hơn 30% so với whey thông thường.', 1850000.00, 2050000.00, 4.4, 210, 50, 1, NULL, NOW(), NOW()),
(15, 1, 'PTS-W15', 'dymatize-elite-100-whey-5lbs', 'Dymatize Elite 100% Whey 5lbs', 'Nguồn Whey 100% Concentrate kết hợp Isolate giá tiết kiệm', 'Elite 100% Whey mang đến 25g protein/serving với hương vị thơm ngon và giá thành tiết kiệm. Chứng nhận Informed-Choice đảm bảo không chất cấm.', 1490000.00, 1690000.00, 4.5, 750, 50, 1, NULL, NOW(), NOW()),
(16, 1, 'PTS-W16', 'whey-labs-100-isolate-5lbs', 'Whey Labs 100% Isolate 5lbs', 'Dòng đạm tinh sạch cao cấp đạt chuẩn kiểm định an toàn từ Úc', 'Whey Labs 100% Isolate sử dụng nguồn sữa bò từ trang trại Úc không hormon tăng trưởng. Quy trình lọc lạnh CFM cho ra 26g protein/serving cực tinh khiết.', 1250000.00, 1450000.00, 4.3, 180, 50, 1, NULL, NOW(), NOW()),
(17, 1, 'PTS-W17', 'allmax-allwhey-gold-5lbs', 'AllMax Nutrition AllWhey Gold 5lbs', 'Sự kết hợp đạm cô lập kinh tế, không gây đầy hơi khó tiêu', 'AllWhey Gold pha trộn whey isolate và concentrate theo tỷ lệ tối ưu, bổ sung enzyme Aminogen® giúp tiêu hóa triệt để. Không gây đầy bụng, phù hợp mọi cơ địa.', 1350000.00, 1550000.00, 4.4, 390, 50, 1, NULL, NOW(), NOW()),
(18, 1, 'PTS-W18', 'pvl-iso-gold-premium-5lbs', 'PVL ISO Gold Premium Isolate 5lbs', 'Bổ sung lợi khuẩn Probiotics cải thiện khả năng đồng hóa chất đạm', 'ISO Gold của PVL kết hợp 25g whey isolate với 1 tỷ CFU probiotic L. acidophilus giúp cải thiện vi hệ đường ruột, tăng hấp thu protein và tăng cường hệ miễn dịch.', 1690000.00, 1890000.00, 4.5, 260, 50, 1, NULL, NOW(), NOW()),
(19, 1, 'PTS-W19', 'scitec-whey-professional-5lbs', 'Scitec Nutrition 100% Whey Professional 5lbs', 'Bổ sung enzyme tiêu hóa chuyên biệt, hấp thụ hoàn toàn đạm', 'Sản phẩm whey protein nổi tiếng từ Châu Âu với formula chứa cả Whey Concentrate và Isolate, bổ sung AmbroZyme enzyme digest. Hơn 60 hương vị đa dạng.', 1490000.00, 1690000.00, 4.5, 620, 50, 1, NULL, NOW(), NOW()),
(20, 1, 'PTS-W20', 'biotechusa-iso-whey-zero-5lbs', 'BiotechUSA Iso Whey Zero 5lbs', 'Dòng sản phẩm whey cô lập hoàn toàn không Lactose', 'Iso Whey Zero của BiotechUSA là lựa chọn hoàn hảo cho người không dung nạp Lactose. 100% Whey Isolate không lactose, không gluten, 23g protein tinh khiết mỗi serving.', 1950000.00, 2150000.00, 4.6, 480, 50, 1, NULL, NOW(), NOW()),
(21, 1, 'PTS-W21', 'amix-gold-isolate-5lbs', 'Amix Gold Isolate Whey Protein 5lbs', '100% Whey Isolate dây chuyền lọc lạnh vi mô tinh sạch Châu Âu', 'Amix Gold Isolate sản xuất tại CH Séc trên dây chuyền CFM lọc lạnh thế hệ mới nhất, đạt 27g protein/serving và được kiểm định Informed Sport toàn cầu.', 2200000.00, 2500000.00, 4.7, 190, 50, 1, NULL, NOW(), NOW()),

-- ─── PRE-WORKOUT (category_id = 2, ID 22–42) ─────────────
(22, 2, 'PTS-M01', 'labrada-lean-body-meal-4-6lbs', 'Labrada Lean Body Meal Replacement 4.6lbs', 'Bữa ăn thay thế hoàn chỉnh tỷ lệ vàng 40g đạm, tinh bột phức hợp', 'Lean Body cung cấp 40g protein, 27 vitamin & khoáng chất, chất xơ và tinh bột phức hợp hấp thụ chậm. Thay thế hoàn hảo cho bữa ăn khi bận rộn.', 1650000.00, 1850000.00, 4.6, 340, 50, 1, NULL, NOW(), NOW()),
(23, 2, 'PTS-M02', 'cellucor-c4-original-preworkout-30serv', 'Cellucor C4 Original Pre-Workout 30 servings', 'Bổ sung năng lượng bùng nổ tỉnh táo tuyệt đối trước tập', 'C4 Original là pre-workout bán chạy nhất thế giới với công thức Beta-Alanine + Creatine Nitrate + Caffeine 150mg cho năng lượng tức thì và pump cơ mạnh mẽ.', 650000.00, 750000.00, 4.5, 2800, 50, 1, NULL, NOW(), NOW()),
(24, 2, 'PTS-M03', 'nutrex-outlift-clinical-20serv', 'Nutrex Outlift Clinical Pre-Workout 20 servings', 'Công thức kích sức mạnh liều lượng lâm sàng cực đại', 'Outlift là pre-workout liều lâm sàng với Citrulline 8g, Beta-Alanine 3.2g, Creatine 3g và Caffeine 350mg. Không ma trận ẩn – toàn bộ thành phần công bố minh bạch.', 850000.00, 990000.00, 4.6, 420, 50, 1, NULL, NOW(), NOW()),
(25, 2, 'PTS-M04', 'jnx-sports-the-curse-50serv', 'JNX Sports The Curse Pre-Workout 50 servings', 'Kích hoạt tập trung cao độ, đánh tan mệt mỏi thể hình', 'The Curse cung cấp Caffeine 200mg, Citrulline Malate 3g và Beta-Alanine 1.5g với 50 servings tiết kiệm. Hương vị trái cây sảng khoái không bị đắng.', 690000.00, 790000.00, 4.4, 610, 50, 1, NULL, NOW(), NOW()),
(26, 2, 'PTS-M05', 'insane-labz-psychotic-pre-35serv', 'Psychotic High Stimulant Pre-Workout 35 serv', 'Thức uống năng lượng siêu mạnh mẽ cho người tập tạ nặng lâu năm', 'Psychotic chứa DMAE Bitartrate và Caffeine Anhydrous liều cao tạo focus cực mạnh. Chỉ nên dùng cho người có kinh nghiệm tập luyện và khả năng chịu kích thích tốt.', 680000.00, 780000.00, 4.3, 550, 50, 1, NULL, NOW(), NOW()),
(27, 2, 'PTS-M06', 'redcon1-total-war-30serv', 'Redcon1 Total War Pre-Workout 30 servings', 'Kết hợp hoàn hảo giữa năng lượng tỉnh táo và pump phồng sợi cơ', 'Total War là pre-workout 2-trong-1: năng lượng mạnh từ Caffeine 250mg + DMHA và pump cực độ từ Citrulline Malate 6g + AgmaMax 1g. Ưa thích của giới bodybuilding.', 790000.00, 890000.00, 4.5, 730, 50, 1, NULL, NOW(), NOW()),
(28, 2, 'PTS-M07', 'applied-nutrition-abe-pre-30serv', 'Applied Nutrition ABE Pre-Workout 30 serv', 'Sản phẩm kích năng lượng tập luyện bán chạy nhất vương quốc Anh', 'ABE (All Black Everything) chứa Caffeine 200mg, 3.2g Beta-Alanine và 150mg KSM-66 Ashwagandha. Đây là pre-workout số 1 tại UK với hơn 20 hương vị độc đáo.', 720000.00, 820000.00, 4.5, 890, 50, 1, NULL, NOW(), NOW()),
(29, 2, 'PTS-M08', 'ghost-legend-preworkout-30serv', 'Ghost Legend Pre-Workout 30 servings', 'Gia tăng hiệu suất cơ bắp bền bỉ, thành phần minh bạch 100%', 'Ghost Legend tự hào với công thức Transparent Label hoàn toàn, không prop blend. Citrulline 4g, Beta-Alanine 3.2g, Alpha-GPC 150mg và Caffeine 200mg.', 950000.00, 1100000.00, 4.7, 1100, 50, 1, NULL, NOW(), NOW()),
(30, 2, 'PTS-M09', 'muscletech-vapor-x5-nextgen-30serv', 'Vapor X5 Next Gen Muscletech 30 servings', 'Công thức khoa học 5 trong 1 thúc đẩy năng lượng tập trung tối đa', 'Vapor X5 là hệ thống pre-workout 5-trong-1: Sensory Complex, Muscle Amplifier, Performance Booster, Pump Activator và Energy Accelerator trong một scoop.', 650000.00, 750000.00, 4.4, 480, 50, 1, NULL, NOW(), NOW()),
(31, 2, 'PTS-M10', 'prosupps-mr-hyde-nitrox-30serv', 'Mr. Hyde NitroX Pre-Workout 30 servings', 'Năng lượng bùng nổ mãnh liệt phối hợp bơm phồng cơ sợi bắp', 'Mr. Hyde NitroX cung cấp Caffeine Matrix 400mg 3 lớp (Anhydrous + Di-Caffeine Malate + Caffeine Citrate) cho năng lượng bền bỉ 3-4 giờ không bị crash.', 690000.00, 790000.00, 4.4, 390, 50, 1, NULL, NOW(), NOW()),
(32, 2, 'PTS-M11', 'jym-pre-jym-high-performance-30serv', 'Pre-JYM High Performance 30 servings', 'Công thức thiết kế hoàn hảo minh bạch bởi Dr. Jim Stoppani', 'Pre-JYM là pre-workout đầu tiên đưa ra nguyên tắc full-disclosure label với 13 thành phần ở liều lâm sàng. Không prop blend, không chất độn. Khoa học và hiệu quả.', 1100000.00, 1250000.00, 4.7, 580, 50, 1, NULL, NOW(), NOW()),
(33, 2, 'PTS-M12', '5-nutrition-kill-it-30serv', 'Kill It Pre-Workout Rich Piana 30 servings', 'Thúc đẩy sức bền thể lực tối ưu theo phong cách chiến binh', 'Kill It là triết lý "chỉ cho 5% những ai thực sự chiến" – pre-workout với Citrulline Malate, Beta-Alanine, Agmatine và Caffeine thiết kế cho buổi tập khắc nghiệt nhất.', 820000.00, 950000.00, 4.4, 430, 50, 1, NULL, NOW(), NOW()),
(34, 2, 'PTS-M13', 'gaspari-superpump-max-30serv', 'SuperPump Max Gaspari 30 servings', 'Cung cấp năng lượng điện giải dồi dào, chống khô mỏi mệt cơ', 'SuperPump Max từ Gaspari Nutrition chứa L-Citrulline Silicate và hệ điện giải Sustamine® giúp duy trì hiệu suất và chống mệt mỏi suốt buổi tập.', 780000.00, 890000.00, 4.3, 320, 50, 1, NULL, NOW(), NOW()),
(35, 2, 'PTS-M14', 'blackstone-labs-dust-x-25serv', 'Dust X Extreme Stimulant 25 servings', 'Sản phẩm năng lượng cường độ cực mạnh chuyên sâu tập gym', 'Dust X là sản phẩm kích thích cực mạnh từ Blackstone Labs, chứa DMHA và Synephrine HCl tạo ra tăng kích động tuyệt đối. Chỉ dành cho người có kinh nghiệm.', 890000.00, 990000.00, 4.3, 260, 50, 1, NULL, NOW(), NOW()),
(36, 2, 'PTS-M15', 'huge-supplements-wrecked-20serv', 'Wrecked Pre-Workout Huge Supps 20 serv', 'Liều lượng kích thích khổng lồ giúp nâng cao thể lực đẩy tạ nặng', 'Wrecked sử dụng 17 thành phần ở liều lượng khổng lồ: Citrulline 8g, HydroPrime Glycerol 3g, Beta-Alanine 3.5g và Caffeine 250mg. Pre-workout không thỏa hiệp.', 1150000.00, 1300000.00, 4.6, 310, 50, 1, NULL, NOW(), NOW()),
(37, 2, 'PTS-M16', 'gnc-beyond-raw-lit-30serv', 'Lit Pre-Workout Beyond Raw 30 servings', 'Cung cấp năng lượng sạch chuẩn hóa phòng thí nghiệm y tế GNC', 'LIT của GNC Beyond Raw sử dụng NeuroFactor™ (chiết xuất vỏ quả cà phê) và ElevATP® (chiết xuất cổ đại) tăng sản xuất ATP nội tế bào, cho năng lượng sạch không crash.', 920000.00, 1050000.00, 4.5, 490, 50, 1, NULL, NOW(), NOW()),
(38, 2, 'PTS-M17', 'evl-engn-shred-30serv', 'ENGN Shred Pre-Workout EVL 30 servings', 'Công thức tác động kép tăng năng lượng đồng thời đốt mỡ sinh nhiệt', 'ENGN Shred là pre-workout kết hợp chất đốt mỡ sinh nhiệt CLA 500mg, L-Carnitine 500mg với năng lượng từ Caffeine 210mg. Giải pháp 2-in-1 cho giai đoạn siết.', 750000.00, 850000.00, 4.4, 420, 50, 1, NULL, NOW(), NOW()),
(39, 2, 'PTS-M18', 'gat-sport-nitraflex-30serv', 'Nitraflex Hyperemia GAT Sport 30 serv', 'Thúc đẩy oxit nitric giãn mạch máu tối đa vận chuyển dinh dưỡng', 'Nitraflex là pre-workout độc đáo với Clinical Strength Testosterone-Enhancing Compound (DOPA Mucuna 300mg) kết hợp Citrulline/Arginine 7g tăng NO mạnh.', 760000.00, 860000.00, 4.4, 380, 50, 1, NULL, NOW(), NOW()),
(40, 2, 'PTS-M19', 'alani-nu-pre-workout-30serv', 'Alani Nu Pre-Workout 30 servings', 'Công thức năng lượng tinh tế êm dịu phù hợp thể hình cho cả nam nữ', 'Alani Nu Pre-Workout với 200mg Caffeine, L-Citrulline Malate 6g và Beta-Alanine 1.6g phù hợp cả nam lẫn nữ. Không chứa nhân tạo, hương vị trái cây tự nhiên thơm ngon.', 880000.00, 980000.00, 4.6, 1200, 50, 1, NULL, NOW(), NOW()),
(41, 2, 'PTS-M20', 'ryse-godzilla-preworkout-40serv', 'Ryse Godzilla Pre-Workout 40 servings', 'Phiên bản Godzilla năng lượng khổng lồ phá vỡ mọi rào cản tập tạ', 'Godzilla Pre-Workout của Ryse là sản phẩm khổng lồ với full scoop chứa Citrulline 9g, Beta-Alanine 3.5g và Caffeine 400mg. 40 servings ở liều toàn phần cực kỳ kinh tế.', 1350000.00, 1550000.00, 4.7, 680, 50, 1, NULL, NOW(), NOW()),
(42, 2, 'PTS-M21', 'aps-mesomorph-ultimate-25serv', 'APS Mesomorph Ultimate Pre-Workout 25serv', 'Công thức năng lượng kinh điển đưa buổi tập lên tầm cao mới', 'Mesomorph được mệnh danh là "pre-workout kinh điển nhất mọi thời đại" với DMAA (lúc còn hợp pháp) thay thế bằng DMHA thế hệ mới. Tập trung cực kỳ cao và pump đỉnh.', 950000.00, 1050000.00, 4.5, 240, 50, 1, NULL, NOW(), NOW()),

-- ─── PROTEIN BARS & SNACKS (category_id = 3, ID 43–63) ─────────────────────
(43, 3, 'PTS-S01', 'quest-nutrition-protein-bar-60g', 'Quest Nutrition Protein Bar 60g', 'Thanh đạm ăn kiêng bán chạy nhất thế giới giàu xơ ít carb tinh', 'Quest Bar cung cấp 21g protein, 14g chất xơ và chỉ 4-5g net carb. Sử dụng protein blend Milk/Whey Isolate. Hương vị phong phú như chocolate chip cookie hay cookies & cream.', 65000.00, 75000.00, 4.7, 8900, 200, 1, NULL, NOW(), NOW()),
(44, 3, 'PTS-S02', 'grenade-carb-killa-60g', 'Grenade Carb Killa Protein Bar 60g', 'Bánh đạm nướng tinh tế cấu trúc nhiều lớp giòn tan ít đường', 'Carb Killa là thanh protein số 1 Châu Âu với vỏ sô-cô-la thật, nhân kem xốp nhiều lớp. 23g protein, chỉ 1-2g đường. Hương vị như bánh ngọt thật sự.', 70000.00, 80000.00, 4.8, 6200, 200, 1, NULL, NOW(), NOW()),
(45, 3, 'PTS-S03', 'barebells-protein-bar-55g', 'Barebells Protein Bar Thụy Điển 55g', 'Bánh xốp dinh dưỡng protein không thêm đường vị ngon chuẩn Châu Âu', 'Barebells từ Thụy Điển nổi tiếng với hương vị đỉnh cao không thua gì kẹo chocolate thật. 20g protein, 0g thêm đường. Các hương vị Salty Peanut và Cookies Cream được yêu thích.', 68000.00, 78000.00, 4.8, 4100, 200, 1, NULL, NOW(), NOW()),
(46, 3, 'PTS-S04', 'myprotein-impact-protein-bar-64g', 'MyProtein Impact Protein Bar 64g', 'Thanh đạm 3 lớp bổ vị caramel béo ngậy ít calo', 'Impact Bar của MyProtein có lớp nền đạm chắc, lớp giữa caramel mềm mịn và lớp sô-cô-la phủ bên ngoài. 21g protein, giá cực kỳ cạnh tranh trong phân khúc UK.', 62000.00, 72000.00, 4.5, 2300, 200, 1, NULL, NOW(), NOW()),
(47, 3, 'PTS-S05', 'musclepharm-combat-crunch-63g', 'Combat Crunch Protein Bar MusclePharm 63g', 'Bánh quy protein nướng đạt nhiều chứng nhận danh giá thể hình', 'Combat Crunch có kết cấu giòn xốp độc đáo nhờ công nghệ nướng đặc biệt. 20g protein/bar, chứng nhận Informed-Sport, không dùng rượu đường hay HFCS.', 65000.00, 75000.00, 4.6, 3400, 200, 1, NULL, NOW(), NOW()),
(48, 3, 'PTS-S06', 'bsn-protein-crisp-syntha6-57g', 'BSN Protein Crisp Syntha-6 Bar 57g', 'Thanh đạm giòn xốp như cốm gạo nhẹ bụng dễ hấp thụ sau tập', 'Protein Crisp của BSN có kết cấu giòn xốp nhờ Puffed Quinoa và Rice Crisps. 20g protein từ Syntha-6 matrix, ít carb, ít mỡ. Nhẹ nhàng và dễ ăn sau tập.', 65000.00, 75000.00, 4.4, 1800, 200, 1, NULL, NOW(), NOW()),
(49, 3, 'PTS-S07', 'robert-irvine-fit-crunch-bar-46g', 'Robert Irvine Fit Crunch Bar 46g', 'Bánh đạm thiết kế bởi đầu bếp Mỹ Robert Irvine hương vị thượng hạng', 'Fit Crunch do Chef Robert Irvine tạo ra với kết cấu wafer 6 lớp độc đáo tẩm sô-cô-la. 16g protein, 8 hương vị như Peanut Butter, Cookies & Cream siêu ngon.', 60000.00, 70000.00, 4.5, 1500, 200, 1, NULL, NOW(), NOW()),
(50, 3, 'PTS-S08', 'one-brands-protein-bar-60g', 'ONE Brands ONE Protein Bar 60g', 'Cung cấp 20g đạm tinh khiết, hàm lượng đường cực thấp chỉ 1g', 'ONE Bar nổi bật với 20g protein và chỉ 1g đường – một trong những tỷ lệ protein-đường tốt nhất thị trường. Hơn 15 hương vị đa dạng, phù hợp chế độ keto và low-carb.', 65000.00, 75000.00, 4.6, 2700, 200, 1, NULL, NOW(), NOW()),

-- ─── CREATINE (category_id = 4, ID 51-65) ──────────────────────────────────
(51, 4, 'PTS-C01', 'on-micronized-creatine-powder-600g', 'Optimum Nutrition Micronized Creatine 600g', 'Creatine tinh khiết 100% giúp tăng sức mạnh và kích thước cơ bắp', 'Cung cấp 5g Creatine Monohydrate nguyên chất mỗi khẩu phần, không mùi, dễ dàng pha trộn với whey protein hoặc thức uống yêu thích.', 650000.00, 750000.00, 4.8, 1500, 100, 1, NULL, NOW(), NOW()),
(52, 4, 'PTS-C02', 'muscletech-platinum-creatine-400g', 'MuscleTech Platinum 100% Creatine 400g', 'Hỗ trợ tăng cơ nạc, phục hồi nhanh chóng', 'Sử dụng công nghệ siêu vi lọc (micronized) giúp Creatine hòa tan cực tốt và hấp thu tối đa vào cơ bắp, không gây đầy bụng.', 450000.00, 550000.00, 4.7, 1200, 150, 1, NULL, NOW(), NOW()),
(53, 4, 'PTS-C03', 'rule-1-r1-creatine-375g', 'Rule 1 R1 Creatine 375g', '100% Creatine Monohydrate chuẩn y tế', 'Sản phẩm từ hãng Rule 1 cung cấp nguồn Creatine sạch, không tạp chất, giúp tái tạo ATP nhanh chóng trong các bài tập tạ nặng.', 420000.00, 490000.00, 4.6, 850, 80, 1, NULL, NOW(), NOW()),
(54, 4, 'PTS-C04', 'mutant-creakong-cx8-249g', 'Mutant Creakong CX8 249g', 'Phức hợp 3 loại Creatine cao cấp nhất', 'Kết hợp Creatine Monohydrate, Creatine Magnalite và Creatine Chelated giúp đẩy lùi sự mệt mỏi, tổng hợp protein nhanh hơn gấp 3 lần.', 550000.00, 620000.00, 4.5, 640, 60, 1, NULL, NOW(), NOW()),
(55, 4, 'PTS-C05', 'myprotein-creatine-monohydrate-250g', 'MyProtein Creatine Monohydrate 250g', 'Giải pháp tăng sức mạnh tiết kiệm và hiệu quả', 'Sản phẩm quốc dân từ MyProtein, thuần chay, không hương liệu, độ tinh khiết cao đáp ứng nhu cầu tập luyện hàng ngày.', 250000.00, 300000.00, 4.4, 3200, 200, 1, NULL, NOW(), NOW()),
(56, 4, 'PTS-C06', 'cellucor-cor-performance-creatine-360g', 'Cellucor COR-Performance Creatine 360g', 'Tối ưu hóa sức bền và khối lượng tạ', 'Mỗi serving chứa 5g Creatine siêu mịn, giúp bạn đẩy tạ nặng hơn và kéo dài thời gian tập luyện cường độ cao.', 480000.00, 560000.00, 4.5, 420, 50, 1, NULL, NOW(), NOW()),
(57, 4, 'PTS-C07', 'dymatize-creatine-micronized-500g', 'Dymatize Creatine Micronized 500g', 'Sản xuất theo tiêu chuẩn Creapure Đức', 'Sử dụng nguồn nguyên liệu Creapure® nguyên chất từ Đức, đảm bảo không lẫn tạp chất, tối ưu cho việc tích nước trong tế bào cơ.', 680000.00, 780000.00, 4.8, 930, 40, 1, NULL, NOW(), NOW()),
(58, 4, 'PTS-C08', 'bpi-sports-best-creatine-300g', 'BPI Sports Best Creatine 300g', 'Pha trộn 6 loại Creatine khác nhau', 'Công thức Best Creatine™ độc quyền kết hợp 6 dạng creatine giúp cơ thể hấp thu toàn diện mà không cần giai đoạn "loading".', 520000.00, 600000.00, 4.3, 510, 70, 1, NULL, NOW(), NOW()),
(59, 4, 'PTS-C09', 'nutrex-creatine-drive-300g', 'Nutrex Creatine Drive 300g', 'Creatine nguyên chất 100% không pha tạp', 'Sản phẩm an toàn và hiệu quả, phù hợp cho mọi đối tượng chơi thể thao cần tăng cường năng lượng bùng nổ tức thì.', 400000.00, 480000.00, 4.4, 380, 90, 1, NULL, NOW(), NOW()),
(60, 4, 'PTS-C10', 'allmax-creatine-monohydrate-400g', 'AllMax Nutrition Creatine 400g', 'Creatine siêu vi hạt chuẩn dược phẩm', 'Sản xuất qua công nghệ vi hạt hóa cấp độ dược phẩm, loại bỏ hoàn toàn tình trạng sạn khi uống, tan cực nhanh trong nước.', 490000.00, 580000.00, 4.6, 750, 60, 1, NULL, NOW(), NOW()),
(61, 4, 'PTS-C11', 'biotechusa-100-creatine-monohydrate-300g', 'BiotechUSA 100% Creatine Monohydrate 300g', 'Tăng sinh ATP tự nhiên cho cơ bắp', 'Sản phẩm tinh khiết từ Châu Âu giúp cải thiện hiệu suất các bài tập ngắn hạn, cường độ cao như cử tạ, chạy nước rút.', 350000.00, 420000.00, 4.5, 620, 120, 1, NULL, NOW(), NOW()),
(62, 4, 'PTS-C12', 'scitec-100-creatine-monohydrate-300g', 'Scitec Nutrition 100% Creatine 300g', 'Hỗ trợ phồng cơ, giữ nước nội bào', 'Creatine từ Scitec luôn nổi tiếng về chất lượng, giúp cơ bắp trông to và săn chắc hơn nhờ cơ chế hydrat hóa tế bào.', 380000.00, 450000.00, 4.4, 490, 80, 1, NULL, NOW(), NOW()),
(63, 4, 'PTS-C13', 'kaged-muscle-creatine-hcl-75-serv', 'Kaged Muscle Creatine HCl 75 Servings', 'Creatine HCl hấp thụ cực mạnh không tích nước dưới da', 'Dạng Creatine Hydrochloride (HCl) đã được cấp bằng sáng chế, chỉ cần liều lượng nhỏ (1-2g) nhưng hấp thu nhanh hơn Monohydrate gấp nhiều lần.', 650000.00, 750000.00, 4.8, 880, 50, 1, NULL, NOW(), NOW()),
(64, 4, 'PTS-C14', 'rsp-creatine-monohydrate-500g', 'RSP Nutrition Creatine Monohydrate 500g', 'Giải pháp phục hồi siêu tốc sau buổi tập', 'Giảm thiểu đau nhức cơ bắp và hỗ trợ phát triển mô cơ mới hiệu quả. Không mùi, không vị, dễ uống.', 460000.00, 550000.00, 4.3, 310, 60, 1, NULL, NOW(), NOW()),
(65, 4, 'PTS-C15', 'pvl-100-pure-creatine-300g', 'PVL 100% Pure Creatine 300g', 'Creatine tinh khiết đã qua kiểm định Informed-Choice', 'Đảm bảo 100% không chứa chất cấm trong thể thao. Tăng cường khối lượng cơ nạc và sức mạnh tổng thể đáng kể.', 430000.00, 500000.00, 4.5, 450, 70, 1, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    category_id = VALUES(category_id),
    name = VALUES(name),
    price = VALUES(price),
    old_price = VALUES(old_price),
    updated_at = NOW();

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `product_images`;

INSERT INTO `product_images` (`product_id`, `image_url`, `sort_order`, `is_primary`) VALUES
(1,  '/uploads/products/image-1.jpg',  1, 1),
(2,  '/uploads/products/image-2.jpg',  1, 1),
(3,  '/uploads/products/image-3.jpg',  1, 1),
(4,  '/uploads/products/image-4.jpg',  1, 1),
(5,  '/uploads/products/image-5.jpg',  1, 1),
(6,  '/uploads/products/image-6.jpg',  1, 1),
(7,  '/uploads/products/image-7.jpg',  1, 1),
(8,  '/uploads/products/image-8.jpg',  1, 1),
(9,  '/uploads/products/image-9.jpg',  1, 1),
(10, '/uploads/products/image-10.jpg', 1, 1),
(11, '/uploads/products/image-11.jpg', 1, 1),
(12, '/uploads/products/image-12.jpg', 1, 1),
(13, '/uploads/products/image-13.jpg', 1, 1),
(14, '/uploads/products/image-14.jpg', 1, 1),
(15, '/uploads/products/image-15.jpg', 1, 1),
(16, '/uploads/products/image-16.jpg', 1, 1),
(17, '/uploads/products/image-17.jpg', 1, 1),
(18, '/uploads/products/image-18.jpg', 1, 1),
(19, '/uploads/products/image-19.jpg', 1, 1),
(20, '/uploads/products/image-20.jpg', 1, 1),
(21, '/uploads/products/image-21.jpg', 1, 1),
(22, '/uploads/products/image-22.jpg', 1, 1),
(23, '/uploads/products/image-23.jpg', 1, 1),
(24, '/uploads/products/image-24.jpg', 1, 1),
(25, '/uploads/products/image-25.jpg', 1, 1),
(26, '/uploads/products/image-26.jpg', 1, 1),
(27, '/uploads/products/image-27.jpg', 1, 1),
(28, '/uploads/products/image-28.jpg', 1, 1),
(29, '/uploads/products/image-29.jpg', 1, 1),
(30, '/uploads/products/image-30.jpg', 1, 1),
(31, '/uploads/products/image-31.jpg', 1, 1),
(32, '/uploads/products/image-32.jpg', 1, 1),
(33, '/uploads/products/image-33.jpg', 1, 1),
(34, '/uploads/products/image-34.jpg', 1, 1),
(35, '/uploads/products/image-35.jpg', 1, 1),
(36, '/uploads/products/image-36.jpg', 1, 1),
(37, '/uploads/products/image-37.jpg', 1, 1),
(38, '/uploads/products/image-38.jpg', 1, 1),
(39, '/uploads/products/image-39.jpg', 1, 1),
(40, '/uploads/products/image-40.jpg', 1, 1),
(41, '/uploads/products/image-41.jpg', 1, 1),
(42, '/uploads/products/image-42.jpg', 1, 1),
(43, '/uploads/products/image-43.jpg', 1, 1),
(44, '/uploads/products/image-44.jpg', 1, 1),
(45, '/uploads/products/image-45.jpg', 1, 1),
(46, '/uploads/products/image-46.jpg', 1, 1),
(47, '/uploads/products/image-47.jpg', 1, 1),
(48, '/uploads/products/image-48.jpg', 1, 1),
(49, '/uploads/products/image-49.jpg', 1, 1),
(50, '/uploads/products/image-50.jpg', 1, 1),
(51, '/uploads/products/image-51.jpg', 1, 1),
(52, '/uploads/products/image-52.jpg', 1, 1),
(53, '/uploads/products/image-53.jpg', 1, 1),
(54, '/uploads/products/image-54.jpg', 1, 1),
(55, '/uploads/products/image-55.jpg', 1, 1),
(56, '/uploads/products/image-56.jpg', 1, 1),
(57, '/uploads/products/image-57.jpg', 1, 1),
(58, '/uploads/products/image-58.jpg', 1, 1),
(59, '/uploads/products/image-59.jpg', 1, 1),
(60, '/uploads/products/image-60.jpg', 1, 1),
(61, '/uploads/products/image-61.jpg', 1, 1),
(62, '/uploads/products/image-62.jpg', 1, 1),
(63, '/uploads/products/image-63.jpg', 1, 1),
(64, '/uploads/products/image-64.jpg', 1, 1),
(65, '/uploads/products/image-65.jpg', 1, 1);
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `product_tag_map` (`product_id`, `tag_id`) VALUES
(1, 1), (1, 3),
(2, 1), (2, 3),
(3, 3),
(4, 1),
(5, 1),
(7, 3),
(8, 3)
ON DUPLICATE KEY UPDATE product_id = VALUES(product_id);


-- =====================================================
-- 6. PROCEDURE VÀ TRIGGER
-- =====================================================

DELIMITER $$

-- =====================================================
-- PROCEDURE sp_refresh_product_rating
-- Mục đích:
-- - Tính lại rating_avg và rating_count của một sản phẩm.
--
-- Khi nào được gọi:
-- - Sau khi thêm review.
-- - Sau khi sửa review.
-- - Sau khi xóa review.
--
-- Cách hoạt động:
-- - Lấy tất cả review của product_id.
-- - Tính AVG(rating) làm rating_avg.
-- - Đếm số review làm rating_count.
-- - Nếu không còn review thì rating_avg = 0 và rating_count = 0.
-- =====================================================
CREATE PROCEDURE `sp_refresh_product_rating`(IN p_product_id BIGINT)
BEGIN
    UPDATE `products` p
    LEFT JOIN (
        SELECT
            `product_id`,
            ROUND(AVG(`rating`), 2) AS avg_val,
            COUNT(*) AS cnt_val
        FROM `reviews`
        WHERE `product_id` = p_product_id
        GROUP BY `product_id`
    ) r ON p.`id` = r.`product_id`
    SET
        p.`rating_avg` = COALESCE(r.`avg_val`, 0.00),
        p.`rating_count` = COALESCE(r.`cnt_val`, 0)
    WHERE p.`id` = p_product_id;
END$$

-- =====================================================
-- PROCEDURE sp_refresh_order_totals
-- Mục đích:
-- - Tính lại subtotal và total_amount của một đơn hàng.
--
-- Khi nào được gọi:
-- - Sau khi thêm order_items.
-- - Sau khi sửa order_items.
-- - Sau khi xóa order_items.
--
-- Cách hoạt động:
-- - subtotal = tổng line_total của các dòng hàng.
-- - total_amount = subtotal - discount_amount + shipping_fee.
-- - GREATEST(..., 0) để tránh tổng tiền bị âm.
-- =====================================================
CREATE PROCEDURE `sp_refresh_order_totals`(IN p_order_id BIGINT)
BEGIN
    UPDATE `orders` o
    LEFT JOIN (
        SELECT `order_id`, COALESCE(SUM(`line_total`), 0.00) AS subtotal_val
        FROM `order_items`
        WHERE `order_id` = p_order_id
        GROUP BY `order_id`
    ) x ON o.`id` = x.`order_id`
    SET
        o.`subtotal` = COALESCE(x.`subtotal_val`, 0.00),
        o.`total_amount` = GREATEST(COALESCE(x.`subtotal_val`, 0.00) - o.`discount_amount` + o.`shipping_fee`, 0.00)
    WHERE o.`id` = p_order_id;
END$$

-- =====================================================
-- NHÓM TRIGGER reviews
--
-- tr_reviews_after_insert:
-- - Khi thêm review mới, tự cập nhật lại điểm trung bình của sản phẩm.
--
-- tr_reviews_after_update:
-- - Khi sửa review, tự cập nhật lại điểm trung bình.
-- - Nếu review bị chuyển sang product_id khác, cập nhật lại cả sản phẩm cũ và sản phẩm mới.
--
-- tr_reviews_after_delete:
-- - Khi xóa review, tự cập nhật lại điểm trung bình của sản phẩm.
--
-- Vai trò:
-- - Giữ products.rating_avg và products.rating_count luôn đồng bộ với bảng reviews.
-- =====================================================
CREATE TRIGGER `tr_reviews_after_insert`
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
    CALL `sp_refresh_product_rating`(NEW.`product_id`);
END$$

CREATE TRIGGER `tr_reviews_after_update`
AFTER UPDATE ON `reviews`
FOR EACH ROW
BEGIN
    CALL `sp_refresh_product_rating`(NEW.`product_id`);
    IF OLD.`product_id` <> NEW.`product_id` THEN
        CALL `sp_refresh_product_rating`(OLD.`product_id`);
    END IF;
END$$

CREATE TRIGGER `tr_reviews_after_delete`
AFTER DELETE ON `reviews`
FOR EACH ROW
BEGIN
    CALL `sp_refresh_product_rating`(OLD.`product_id`);
END$$

--- ==========================================================
-- 2. LOGIC MỚI: TRỪ KHO NGAY KHI VỪA THÊM SẢN PHẨM VÀO ĐƠN
-- ==========================================================

-- A. Trước khi thêm sản phẩm vào đơn: Check xem kho đủ không
CREATE TRIGGER `tr_order_items_before_insert`
BEFORE INSERT ON `order_items`
FOR EACH ROW
BEGIN
    DECLARE v_current_stock INT;
    
    -- Tính thành tiền
    SET NEW.`line_total` = NEW.`quantity` * NEW.`unit_price`;
    
    -- Lấy tồn kho hiện tại
    SELECT `stock_quantity` INTO v_current_stock 
    FROM `products` WHERE `id` = NEW.`product_id`;
    
    -- Chặn lại ngay lập tức nếu kho không đủ
    IF v_current_stock < NEW.`quantity` THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for product';
    END IF;
END$$

-- B. Sau khi thêm sản phẩm vào đơn hợp lệ: Trừ kho & Ghi log
CREATE TRIGGER `tr_order_items_after_insert`
AFTER INSERT ON `order_items`
FOR EACH ROW
BEGIN
    -- Tính lại tổng tiền của đơn hàng
    CALL `sp_refresh_order_totals`(NEW.`order_id`);
    
    -- Trừ tồn kho
    UPDATE `products`
    SET `stock_quantity` = `stock_quantity` - NEW.`quantity`
    WHERE `id` = NEW.`product_id`;
    
    -- Ghi lịch sử xuất kho (số âm)
    INSERT INTO `stock_movements` (`product_id`, `quantity`, `reason`, `reference_type`, `reference_id`, `note`, `created_at`)
    VALUES (NEW.`product_id`, -NEW.`quantity`, 'ORDER', 'ORDER', NEW.`order_id`, CONCAT('Deducted for new order: ', NEW.`order_id`), NOW());
END$$


-- ==========================================================
-- 3. LOGIC MỚI: KHÓA MÃ GIẢM GIÁ NGAY LÚC ĐẶT HÀNG
-- ==========================================================
CREATE TRIGGER `tr_orders_after_insert`
AFTER INSERT ON `orders`
FOR EACH ROW
BEGIN
    IF NEW.`discount_code_id` IS NOT NULL THEN
        -- Ghi nhận lịch sử dùng mã
        INSERT INTO `discount_usages` (`discount_code_id`, `user_id`, `order_id`, `used_at`)
        VALUES (NEW.`discount_code_id`, NEW.`user_id`, NEW.`id`, NOW());
        
        -- Tăng biến đếm số lượt đã dùng của mã
        UPDATE `discount_codes`
        SET `used_count` = `used_count` + 1
        WHERE `id` = NEW.`discount_code_id`;
    END IF;
END$$


-- ==========================================================
-- 4. LOGIC MỚI: XỬ LÝ CHUYỂN TRẠNG THÁI VÀ HOÀN TRẢ
-- ==========================================================

-- A. Validate khi chuyển trạng thái (Bỏ check kho vì đã check ở trên)
CREATE TRIGGER `tr_orders_before_update_validate_paid`
BEFORE UPDATE ON `orders`
FOR EACH ROW
BEGIN
    DECLARE v_missing_items INT DEFAULT 0;

    -- If payment is confirmed (payment_status → PAID), update order status to CONFIRMED
    IF OLD.payment_status <> 'PAID' AND NEW.payment_status = 'PAID' THEN
        SELECT COUNT(*) INTO v_missing_items FROM `order_items` WHERE `order_id` = NEW.`id`;
        IF v_missing_items = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot mark order as PAID without order items';
        END IF;

        SET NEW.`status` = 'CONFIRMED';
        SET NEW.`paid_at` = COALESCE(NEW.`paid_at`, NOW());
    END IF;

    -- If order is CANCELLED, set canceled timestamp
    IF NEW.`status` = 'CANCELLED' AND OLD.`status` <> 'CANCELLED' THEN
        SET NEW.`canceled_at` = COALESCE(NEW.`canceled_at`, NOW());
    END IF;
END$$

-- B. Ghi lịch sử đơn hàng & TỰ ĐỘNG HOÀN KHO NẾU BỊ HỦY
CREATE TRIGGER `tr_orders_after_update_status_history`
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    -- Ghi lịch sử trạng thái
    IF OLD.`status` <> NEW.`status` THEN
        INSERT INTO `order_status_history` (`order_id`, `old_status`, `new_status`, `changed_note`, `changed_at`)
        VALUES (NEW.`id`, OLD.`status`, NEW.`status`, NULL, NOW());
    END IF;

    -- *** IMPORTANT: IF ORDER IS CANCELLED -> RESTORE STOCK & DISCOUNT ***
    IF OLD.`status` <> 'CANCELLED' AND NEW.`status` = 'CANCELLED' THEN
        
        -- 1. Cộng lại tồn kho cho các sản phẩm
        UPDATE `products` p
        JOIN (
            SELECT `product_id`, SUM(`quantity`) AS total_qty
            FROM `order_items`
            WHERE `order_id` = NEW.`id`
            GROUP BY `product_id`
        ) x ON p.`id` = x.`product_id`
        SET p.`stock_quantity` = p.`stock_quantity` + x.`total_qty`;
        
        -- 2. Ghi lịch sử nhập kho hoàn trả (số dương)
        INSERT INTO `stock_movements` (`product_id`, `quantity`, `reason`, `reference_type`, `reference_id`, `note`, `created_at`)
        SELECT oi.`product_id`, oi.`quantity`, 'RETURN', 'ORDER', NEW.`id`, CONCAT('Restored for canceled order: ', NEW.`order_code`), NOW()
        FROM `order_items` oi
        WHERE oi.`order_id` = NEW.`id`;

        -- 3. Hoàn lại lượt dùng mã giảm giá
        IF NEW.`discount_code_id` IS NOT NULL THEN
            UPDATE `discount_codes`
            SET `used_count` = `used_count` - 1
            WHERE `id` = NEW.`discount_code_id`;
            
            DELETE FROM `discount_usages` WHERE `order_id` = NEW.`id`;
        END IF;

    END IF;
END$$

DELIMITER ;
