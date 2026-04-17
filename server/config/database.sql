CREATE DATABASE IF NOT EXISTS parlour_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parlour_db;

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  email        VARCHAR(180)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  role         ENUM('admin','staff','customer') NOT NULL DEFAULT 'customer',
  phone        VARCHAR(20),
  avatar       VARCHAR(255),
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon        VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT,
  name         VARCHAR(150)   NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2)  NOT NULL,
  duration_min INT            NOT NULL DEFAULT 30,
  image        VARCHAR(255),
  is_active    TINYINT(1)     NOT NULL DEFAULT 1,
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT  NOT NULL UNIQUE,
  specialization VARCHAR(200),
  experience_yrs INT DEFAULT 0,
  bio           TEXT,
  rating        DECIMAL(3,2) DEFAULT 0.00,
  is_available  TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_schedules (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  staff_id     INT NOT NULL,
  day_of_week  TINYINT NOT NULL, -- 0 (Sun) to 6 (Sat)
  start_time   TIME DEFAULT '09:00:00',
  end_time     TIME DEFAULT '18:00:00',
  is_off       TINYINT(1) DEFAULT 0,
  UNIQUE KEY (staff_id, day_of_week),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id   INT NOT NULL,
  service_id INT NOT NULL,
  PRIMARY KEY (staff_id, service_id),
  FOREIGN KEY (staff_id)   REFERENCES staff(id)    ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  date_of_birth DATE,
  gender        ENUM('male','female','other','prefer_not'),
  address       VARCHAR(300),
  loyalty_pts   INT DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  customer_id     INT NOT NULL,
  staff_id        INT NOT NULL,
  service_id      INT NOT NULL,
  appointment_date DATE        NOT NULL,
  start_time      TIME        NOT NULL,
  end_time        TIME        NOT NULL,
  status          ENUM('pending','confirmed','in_progress','completed','cancelled','no_show')
                              NOT NULL DEFAULT 'pending',
  total_price     DECIMAL(10,2),
  notes           TEXT,
  created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id)    REFERENCES staff(id)     ON DELETE CASCADE,
  FOREIGN KEY (service_id)  REFERENCES services(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE,
  customer_id    INT NOT NULL,
  staff_id       INT NOT NULL,
  rating         TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id)    REFERENCES customers(id)    ON DELETE CASCADE,
  FOREIGN KEY (staff_id)       REFERENCES staff(id)        ON DELETE CASCADE
);

INSERT IGNORE INTO users (name, email, password, role, phone) VALUES
('Admin User', 'admin@parlour.com', '$2b$10$9BlGvFj3.MoZ.Cxwxk7fIeCpEZHkXStz9lzchszR.4E062vk8OrRy', 'admin', '9000000000');

INSERT IGNORE INTO service_categories (name, description, icon) VALUES
('Hair Care',    'All hair styling, cutting, colouring & treatment services', 'scissors'),
('Skin Care',    'Facials, clean-ups, bleach & de-tan treatments',             'sparkles'),
('Nail Care',    'Manicure, pedicure & nail art',                              'hand'),
('Body Wellness','Massages, body wraps & relaxation therapies',                'leaf'),
('Bridal',       'Complete bridal packages for the special day',               'heart');

INSERT IGNORE INTO services (category_id, name, description, price, duration_min) VALUES
(1, 'Haircut & Style',       'Wash, cut and blow-dry by expert stylists',        350.00, 45),
(1, 'Hair Colour (Global)',  'Full head global hair colour',                     1200.00, 90),
(1, 'Hair Spa Treatment',    'Deep conditioning hair spa with steam',             800.00, 60),
(1, 'Keratin Treatment',     'Smoothing keratin treatment for frizz-free hair', 2500.00, 120),
(2, 'Basic Facial',          'Deep cleansing facial for glowing skin',            600.00, 60),
(2, 'Gold Facial',           'Luxurious gold facial with sheet mask',            1500.00, 75),
(2, 'De-Tan Treatment',      'Full face & neck de-tan cleanup',                   500.00, 45),
(3, 'Classic Manicure',      'Nail shaping, cuticle care & basic polish',         300.00, 40),
(3, 'Gel Nail Extension',    'Gel extensions with nail art of choice',            900.00, 90),
(3, 'Luxury Pedicure',       'Foot soak, scrub, massage & polish',                450.00, 60),
(4, 'Swedish Massage',       'Full body relaxing Swedish massage',               1800.00, 60),
(4, 'Aromatherapy Massage',  'Therapeutic massage with essential oils',          2200.00, 75),
(5, 'Bridal Makeup',         'HD bridal makeup with premium products',           8000.00, 180),
(5, 'Pre-Bridal Package',    'Facials, waxing & body cleanup package',           5000.00, 240);
