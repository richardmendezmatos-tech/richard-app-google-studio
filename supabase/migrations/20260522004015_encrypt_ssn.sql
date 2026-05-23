-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add SSN column (if missing) and encrypted columns
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS ssn TEXT,
    ADD COLUMN IF NOT EXISTS ssn_encrypted TEXT,
    ADD COLUMN IF NOT EXISTS ssn_encrypted_deterministic TEXT;

-- Encrypt existing SSN values (if any)
UPDATE public.leads
SET
    ssn_encrypted = CASE
        WHEN ssn IS NOT NULL AND ssn != '' THEN pgp_sym_encrypt(ssn, current_setting('app.settings.encryption_key', true))
        ELSE NULL
    END,
    ssn_encrypted_deterministic = CASE
        WHEN ssn IS NOT NULL AND ssn != '' THEN encode(encrypt(ssn::bytea, 'richard-auto-key'::bytea, 'aes-256-cbc'::text), 'base64')
        ELSE NULL
    END
WHERE ssn IS NOT NULL AND ssn != '';

-- Encrypt any incoming SSN via trigger (post-encryption)
CREATE OR REPLACE FUNCTION public.encrypt_ssn_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.ssn IS NOT NULL AND NEW.ssn != '' THEN
        NEW.ssn_encrypted := pgp_sym_encrypt(NEW.ssn, COALESCE(current_setting('app.settings.encryption_key', true), 'richard-auto-default-key'));
        NEW.ssn_encrypted_deterministic := encode(encrypt(NEW.ssn::bytea, 'richard-auto-key'::bytea, 'aes-256-cbc'::text), 'base64');
        NEW.ssn := NULL;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_encrypt_ssn
    BEFORE INSERT OR UPDATE OF ssn ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_ssn_trigger();

COMMENT ON COLUMN public.leads.ssn IS 'Plain-text SSN (auto-cleared by trigger). For storage use only.';
COMMENT ON COLUMN public.leads.ssn_encrypted IS 'PGP encrypted SSN - high security, non-deterministic';
COMMENT ON COLUMN public.leads.ssn_encrypted_deterministic IS 'AES-256-CBC deterministic encryption for lookups (last 4 SSN matching)';
