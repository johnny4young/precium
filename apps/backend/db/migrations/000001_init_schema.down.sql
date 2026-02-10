-- Drop triggers
DROP TRIGGER IF EXISTS update_prices_updated_at ON prices;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_prices_created_at;
DROP INDEX IF EXISTS idx_prices_store_id;
DROP INDEX IF EXISTS idx_prices_product_id;
DROP INDEX IF EXISTS idx_products_name_trgm;
DROP INDEX IF EXISTS idx_products_barcode;
DROP INDEX IF EXISTS idx_products_brand;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_stores_city;
DROP INDEX IF EXISTS idx_stores_slug;
DROP INDEX IF EXISTS idx_stores_location;
DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_users_google_id;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Drop extensions
DROP EXTENSION IF EXISTS "unaccent";
DROP EXTENSION IF EXISTS "pg_trgm";
DROP EXTENSION IF EXISTS "postgis";
DROP EXTENSION IF EXISTS "uuid-ossp";
