-- Add sold_at column to inventory table
ALTER TABLE public.inventory
    ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

-- Also add to dealer_inventory
ALTER TABLE public.dealer_inventory
    ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

-- Update existing sold inventory with approximate date from last_scraped_at
UPDATE public.inventory
SET sold_at = COALESCE(updated_at, last_scraped_at, NOW())
WHERE status IN ('SOLD', 'sold')
  AND sold_at IS NULL;

COMMENT ON COLUMN public.inventory.sold_at IS 'Timestamp when the vehicle was marked as sold';
COMMENT ON COLUMN public.dealer_inventory.sold_at IS 'Timestamp when the inventory item was sold';
