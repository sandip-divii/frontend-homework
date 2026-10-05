-- Homework 2 schema (MariaDB 10.4 / MySQL 8). Idempotent: safe to run repeatedly.
-- Apply with: npm run db:migrate

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  login_id      VARCHAR(50)   NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,            -- scrypt$<salt>$<hash>
  name          VARCHAR(100)  NOT NULL,
  role          ENUM('user', 'expert', 'admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_login_id (login_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expert_services (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category      ENUM('typo', 'cover', 'internal', 'correction') NOT NULL,
  title         VARCHAR(120)  NOT NULL,
  author        VARCHAR(80)   NOT NULL,
  description   TEXT          NULL,
  price         INT UNSIGNED  NOT NULL,            -- KRW, no decimals
  likes         INT UNSIGNED  NOT NULL DEFAULT 0,
  rating        DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
  review_count  INT UNSIGNED  NOT NULL DEFAULT 0,
  thumbnail     VARCHAR(255)  NOT NULL DEFAULT '/images/cover-01.svg',
  created_by    INT UNSIGNED  NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_category (category),
  KEY idx_services_created_at (created_at),
  KEY idx_services_price (price),
  CONSTRAINT fk_services_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
