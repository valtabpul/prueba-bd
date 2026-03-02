-- Database: megastore

-- DROP DATABASE IF EXISTS megastore;


CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    address TEXT
);

CREATE TABLE IF NOT EXISTS product_category(
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS supplier (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    product_sku VARCHAR(150) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    product_category_id INT NOT NULL REFERENCES product_category(id)
);

CREATE TABLE IF NOT EXISTS product_supplier (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES product(id),
    supplier_id INT NOT NULL REFERENCES supplier(id),
    CONSTRAINT product_supplier_unique UNIQUE (product_id, supplier_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL REFERENCES customer(id)
);


CREATE TABLE IF NOT EXISTS transaction_detail (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transactions(id),
    product_supplier_id INT NOT NULL REFERENCES product_supplier(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_line_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT transaction_detail_unique UNIQUE (transaction_id, product_supplier_id)
);