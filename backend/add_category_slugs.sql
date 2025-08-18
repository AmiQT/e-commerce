-- Migration: Add slug support to categories table
-- This script adds a slug column and populates it with URL-friendly versions of category names

-- Add slug column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Update existing categories with slugs
UPDATE categories SET slug = 'new-arrivals' WHERE name = 'New Arrivals';
UPDATE categories SET slug = 'men' WHERE name = 'Men';
UPDATE categories SET slug = 'women' WHERE name = 'Women';
UPDATE categories SET slug = 'accessories' WHERE name = 'Accessories';
UPDATE categories SET slug = 'sale' WHERE name = 'Sale';

-- Make slug column NOT NULL after populating
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;

-- Add trigger function to automatically generate slugs for new categories
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
  NEW.slug := regexp_replace(NEW.slug, '\s+', '-', 'g');
  NEW.slug := trim(both '-' from NEW.slug);
  
  -- Ensure uniqueness by appending number if needed
  WHILE EXISTS (SELECT 1 FROM categories WHERE slug = NEW.slug AND id != NEW.id) LOOP
    NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug on insert/update
DROP TRIGGER IF EXISTS trigger_generate_category_slug ON categories;
CREATE TRIGGER trigger_generate_category_slug
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION generate_category_slug();
