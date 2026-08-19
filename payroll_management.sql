-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 19, 2026 at 06:04 PM
-- Server version: 8.0.46
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `payroll_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `business_id` int NOT NULL,
  `worker_id` int NOT NULL,
  `attendance_date` date NOT NULL,
  `attendance_status` enum('PRESENT','ABSENT','HALF_DAY','LEAVE') NOT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `tenant_id`, `business_id`, `worker_id`, `attendance_date`, `attendance_status`, `remarks`, `created_at`) VALUES
(1, 15, 7, 1, '2026-08-16', 'PRESENT', NULL, '2026-08-16 15:39:08'),
(2, 15, 7, 2, '2026-08-16', 'ABSENT', NULL, '2026-08-16 15:39:08'),
(3, 15, 7, 3, '2026-08-16', 'HALF_DAY', NULL, '2026-08-16 15:39:08'),
(7, 15, 7, 4, '2026-08-17', 'PRESENT', NULL, '2026-08-17 15:28:08'),
(8, 15, 7, 3, '2026-08-17', 'HALF_DAY', NULL, '2026-08-17 15:28:08'),
(9, 15, 7, 2, '2026-08-17', 'PRESENT', NULL, '2026-08-17 15:28:08'),
(10, 15, 7, 1, '2026-08-17', 'PRESENT', NULL, '2026-08-17 15:28:08'),
(11, 15, 7, 4, '2026-08-18', 'PRESENT', NULL, '2026-08-18 14:53:18'),
(12, 15, 7, 3, '2026-08-18', 'PRESENT', NULL, '2026-08-18 14:53:18'),
(13, 15, 7, 2, '2026-08-18', 'PRESENT', NULL, '2026-08-18 14:53:18'),
(14, 15, 7, 1, '2026-08-18', 'PRESENT', NULL, '2026-08-18 14:53:18');

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `business_name` varchar(150) NOT NULL,
  `business_type` varchar(100) DEFAULT NULL,
  `address` text,
  `country_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `zip_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`id`, `tenant_id`, `business_name`, `business_type`, `address`, `country_id`, `state_id`, `city_id`, `status`, `created_at`, `updated_at`, `zip_code`) VALUES
(2, 10, 'Business-A', NULL, NULL, NULL, NULL, NULL, 'ACTIVE', '2026-08-04 15:45:37', '2026-08-04 15:45:37', NULL),
(5, 13, 'Business-B', NULL, NULL, NULL, NULL, NULL, 'ACTIVE', '2026-08-05 11:36:01', '2026-08-05 11:36:01', NULL),
(6, 14, 'acme', NULL, NULL, NULL, NULL, NULL, 'ACTIVE', '2026-08-05 12:03:03', '2026-08-05 12:03:03', NULL),
(7, 15, 'Business-c', NULL, NULL, 1, 1, 1, 'ACTIVE', '2026-08-07 16:08:26', '2026-08-14 15:50:26', '600002');

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int NOT NULL,
  `state_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `state_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 1, 'Chennai', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(2, 1, 'Coimbatore', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(3, 1, 'Madurai', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(4, 2, 'Bengaluru', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(5, 2, 'Mysuru', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(6, 2, 'Mangaluru', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(7, 3, 'Kochi', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(8, 3, 'Thiruvananthapuram', '2026-08-02 11:08:41', '2026-08-02 11:08:41'),
(9, 3, 'Kozhikode', '2026-08-02 11:08:41', '2026-08-02 11:08:41');

-- --------------------------------------------------------

--
-- Table structure for table `country`
--

CREATE TABLE `country` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `country`
--

INSERT INTO `country` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'India', '2026-08-02 11:07:46', '2026-08-02 11:07:46');

-- --------------------------------------------------------

--
-- Table structure for table `platform_users`
--

CREATE TABLE `platform_users` (
  `id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN') NOT NULL DEFAULT 'SUPER_ADMIN',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `platform_users`
--

INSERT INTO `platform_users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'roshan', 'priyan', 'roshanpriyan@gmail.com', '$2b$12$utA3uiQ2Cw526epxyxnesePdo4LqTArPVWiPzTeqIsWp8QG0mTrYi', 'SUPER_ADMIN', 1, '2026-08-08 18:47:22', '2026-08-17 20:48:21'),
(2, 'admin_user1', NULL, 'admin_user1@gmail.com', '$2b$12$G5R0pEUlGazkz4eGOEsQAuG7UXR5lr9faylysbKOObxHz2QJWWuZ.', 'SUPER_ADMIN', 1, '2026-08-09 13:07:57', '2026-08-09 13:07:57'),
(3, 'admin_user2', '2', 'admin_user2@gmail.com', '$2b$12$Gf0Ml0EQVycS2PwJ57TnBOEsrUZj.LpfJrmLIHq04geXJjY8XnrOq', 'SUPER_ADMIN', 1, '2026-08-09 13:50:06', '2026-08-09 15:15:02'),
(4, 'ui_user', 'ui', 'ui_user@gmail.com', '$2b$12$vYrCxaxU5LBytDqmJmGPVuTpIRqAIvvGTsrVsGRsPlT2G8sxfyQCK', 'SUPER_ADMIN', 1, '2026-08-09 15:31:44', '2026-08-09 16:18:14');

-- --------------------------------------------------------

--
-- Table structure for table `state`
--

CREATE TABLE `state` (
  `id` int NOT NULL,
  `country_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `state`
--

INSERT INTO `state` (`id`, `country_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 1, 'Tamil Nadu', '2026-08-02 11:08:14', '2026-08-02 11:08:14'),
(2, 1, 'Karnataka', '2026-08-02 11:08:14', '2026-08-02 11:08:14'),
(3, 1, 'Kerala', '2026-08-02 11:08:14', '2026-08-02 11:08:14');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int NOT NULL,
  `tenant_code` varchar(50) NOT NULL,
  `tenant_name` varchar(150) NOT NULL,
  `subscription_plan` enum('FREE','STANDARD') NOT NULL DEFAULT 'FREE',
  `subscription_start` date NOT NULL,
  `subscription_end` date NOT NULL,
  `status` enum('ACTIVE','TRIAL_EXPIRED','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `tenant_code`, `tenant_name`, `subscription_plan`, `subscription_start`, `subscription_end`, `status`, `created_at`, `updated_at`) VALUES
(10, 'BUSINESS-A_20260804211537110', 'Business-A', 'FREE', '2026-08-04', '2026-09-03', 'ACTIVE', '2026-08-04 15:45:37', '2026-08-04 15:45:37'),
(13, 'BUSINESS-B_20260805170600315', 'Business-B', 'FREE', '2026-08-05', '2026-09-04', 'ACTIVE', '2026-08-05 11:36:00', '2026-08-05 11:36:00'),
(14, 'ACME_20260805173302918', 'acme', 'FREE', '2026-08-05', '2026-09-04', 'ACTIVE', '2026-08-05 12:03:02', '2026-08-05 12:03:02'),
(15, 'BUSINESS-C_20260807213825948', 'Business-c', 'FREE', '2026-08-07', '2026-09-06', 'TRIAL_EXPIRED', '2026-08-07 16:08:25', '2026-08-14 16:21:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `tenant_id`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 10, 'local', 'user', 'localuser@gmail.com', '1234567890', '$2b$12$Lpf1rB8YCK2trtZEmRI6/O6Y1HAsF41N6Ki8iWFQ562VbBP11Gw/y', 'ACTIVE', '2026-08-08 16:08:46', '2026-08-04 15:45:37', '2026-08-08 10:38:46'),
(2, 13, 'local', 'user', 'localuser1@gmail.com', '1234567890', '$2b$12$tcZqmxIRwYcpnmE/Puge8OIwx/FseW9FITblJLCBZzwcEZYiq37/S', 'ACTIVE', '2026-08-05 19:24:41', '2026-08-05 11:36:01', '2026-08-05 13:54:41'),
(3, 14, 'john', 'doe', 'johndoe@gmail.com', '1010101010', '$2b$12$8je6OAa7o29VqXBNf68iVO6xaSa.MguYHTrVJRs2ggJ8iWbWEAaae', 'ACTIVE', NULL, '2026-08-05 12:03:03', '2026-08-05 12:03:03'),
(4, 15, 'local', 'user', 'localuserc@gmail.com', '1234567890', '$2b$12$8S7Stoa3pf9RnuyyG94FoOnnORWAp9OLO6hUYNXJJjtxUGn9eAixq', 'ACTIVE', '2026-08-19 20:40:15', '2026-08-07 16:08:26', '2026-08-19 15:10:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `address` text,
  `country_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `address`, `country_id`, `state_id`, `city_id`, `zip_code`, `created_at`, `updated_at`, `tenant_id`) VALUES
(1, 4, 'local', 'userc', '', 1, 3, 7, '123456', '2026-08-07 21:38:26', '2026-08-08 17:04:45', 15);

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `business_id` int NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` enum('MALE','FEMALE') DEFAULT NULL,
  `joining_date` date NOT NULL,
  `salary_type` enum('DAILY','WEEKLY','MONTHLY') NOT NULL,
  `salary_amount` decimal(10,2) NOT NULL,
  `payment_mode` enum('CASH','BANK','UPI') NOT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `upi_id` varchar(150) DEFAULT NULL,
  `address` text,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `workers`
--

INSERT INTO `workers` (`id`, `tenant_id`, `business_id`, `first_name`, `last_name`, `phone`, `email`, `gender`, `joining_date`, `salary_type`, `salary_amount`, `payment_mode`, `bank_name`, `account_number`, `ifsc_code`, `upi_id`, `address`, `status`, `created_at`, `updated_at`) VALUES
(1, 15, 7, 'Raj1', 'last name', '9876543210', NULL, NULL, '2026-08-10', 'DAILY', 700.00, 'CASH', NULL, NULL, NULL, NULL, NULL, 'ACTIVE', '2026-08-10 15:32:38', '2026-08-12 15:41:22'),
(2, 15, 7, 'Raj', 'Kumar', '9876543211', NULL, NULL, '2026-08-10', 'MONTHLY', 600.00, 'BANK', 'HDFC Bank', '1234567890', 'HDFC0001234', NULL, NULL, 'ACTIVE', '2026-08-10 15:33:45', '2026-08-10 15:36:56'),
(3, 15, 7, 'Raj', 'a', '9876543212', 'raj_a@gmail.com', 'MALE', '2026-08-10', 'WEEKLY', 1000.00, 'UPI', NULL, NULL, NULL, 'raj@paytm', NULL, 'ACTIVE', '2026-08-10 15:34:00', '2026-08-17 15:25:55'),
(4, 15, 7, 'workera', '', '9494949484', 'worker_a@gmail.com', 'MALE', '2026-08-17', 'MONTHLY', 500.00, 'UPI', NULL, NULL, NULL, 'worker_a@gmail.com', NULL, 'ACTIVE', '2026-08-17 15:27:12', '2026-08-17 15:27:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `worker_id` (`worker_id`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tenant_id` (`tenant_id`),
  ADD KEY `fk_business_country` (`country_id`),
  ADD KEY `fk_business_state` (`state_id`),
  ADD KEY `fk_business_city` (`city_id`);

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_city_state` (`state_id`);

--
-- Indexes for table `country`
--
ALTER TABLE `country`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `platform_users`
--
ALTER TABLE `platform_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `state`
--
ALTER TABLE `state`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_state_country` (`country_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tenant_code` (`tenant_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_tenant` (`tenant_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_profiles_user` (`user_id`),
  ADD KEY `fk_user_profiles_country` (`country_id`),
  ADD KEY `fk_user_profiles_state` (`state_id`),
  ADD KEY `fk_user_profiles_city` (`city_id`),
  ADD KEY `fk_workers_tenant` (`tenant_id`);

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`),
  ADD KEY `business_id` (`business_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `country`
--
ALTER TABLE `country`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `platform_users`
--
ALTER TABLE `platform_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `state`
--
ALTER TABLE `state`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`),
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`);

--
-- Constraints for table `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `fk_business_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`),
  ADD CONSTRAINT `fk_business_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`),
  ADD CONSTRAINT `fk_business_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`),
  ADD CONSTRAINT `fk_business_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Constraints for table `city`
--
ALTER TABLE `city`
  ADD CONSTRAINT `fk_city_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `state`
--
ALTER TABLE `state`
  ADD CONSTRAINT `fk_state_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`);

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_user_profiles_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_user_profiles_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_user_profiles_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_workers_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `workers`
--
ALTER TABLE `workers`
  ADD CONSTRAINT `workers_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
  ADD CONSTRAINT `workers_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
