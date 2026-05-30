BEGIN;

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS type TEXT;

UPDATE inventory SET type = 'pickup'
WHERE (type IS NULL OR type = '')
AND model ~* 'F-150|F-250|F-350|F-450|F-550|Ranger|Maverick|Super Duty|Raptor';

UPDATE inventory SET type = 'coupe'
WHERE (type IS NULL OR type = '')
AND model ~* 'Mustang';

UPDATE inventory SET type = 'suv'
WHERE (type IS NULL OR type = '')
AND model ~* 'Explorer|Bronco|Escape|Edge|Expedition|Bronco Sport';

UPDATE inventory SET type = 'van'
WHERE (type IS NULL OR type = '')
AND model ~* 'Transit|E-Series|Econoline';

UPDATE inventory SET type = 'suv'
WHERE type IS NULL OR type = '';

CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory(type);

COMMIT;
