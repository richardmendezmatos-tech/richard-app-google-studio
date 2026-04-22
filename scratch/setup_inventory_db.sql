-- SQL Migration: Initialize Inventory Table
-- Run this in your Supabase SQL Editor if the sync fails with "table not found"

-- Enable pgvector if you plan to use inventory_vectors later
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  trim TEXT,
  body_style TEXT,
  transmission TEXT,
  engine TEXT,
  drive_train TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  mileage INTEGER,
  price DECIMAL(12,2) NOT NULL,
  msrp DECIMAL(12,2),
  condition TEXT NOT NULL, -- NEW, USED, CERTIFIED
  status TEXT NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, PENDING, SOLD
  images TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}',
  last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_make_model ON inventory(make, model);

-- Table for search gap analysis (Neural Engine)
CREATE TABLE IF NOT EXISTS inventory_vectors (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536), -- Assuming OpenAI embeddings
  created_at TIMESTAMPTZ DEFAULT NOW()
);
