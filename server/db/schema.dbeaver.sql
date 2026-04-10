-- MySQL schema for DBeaver import
-- Based on web-project-source schema/migrations
-- Run in DBeaver SQL Editor against your target database.

CREATE TABLE IF NOT EXISTS `orders` (
  `ref` varchar(32) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `placed_at` varchar(40) NOT NULL,
  `status` enum('pending','in_progress','ready','completed','cancelled') NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_provider` varchar(32) DEFAULT NULL,
  `stripe_checkout_session_id` varchar(255) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `payment_currency` varchar(8) DEFAULT NULL,
  `payment_amount_cents` int unsigned DEFAULT NULL,
  `paid_at` varchar(40) DEFAULT NULL,
  `eta_minutes` tinyint unsigned DEFAULT NULL,
  `cancellation_note` text,
  `cancelled_by` enum('admin','customer') DEFAULT NULL,
  `notification_dismissed_at` varchar(40) DEFAULT NULL,
  `form_json` text NOT NULL,
  `order_entries_json` text NOT NULL,
  `total_price` double NOT NULL,
  PRIMARY KEY (`ref`)
);

CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_unique` (`email`)
);

CREATE TABLE IF NOT EXISTS `customer_email_verification_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token_hash` varchar(128) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `expires_at` varchar(40) NOT NULL,
  `created_at` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_email_verification_tokens_token_hash_unique` (`token_hash`)
);
