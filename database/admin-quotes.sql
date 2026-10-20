-- Administrative quotations. Independent from reservations and availability.
-- Apply once, before deploying the quotations feature. No existing tables change.
CREATE TABLE public.admin_quotes (
  id uuid PRIMARY KEY,
  quote_number text NOT NULL UNIQUE,
  share_token text NOT NULL UNIQUE CHECK (share_token ~ '^[A-Za-z0-9_-]{43}$'),
  snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object' AND coalesce(snapshot->>'version', '') = '1'),
  payment_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CHECK (expires_at > created_at)
);
CREATE INDEX admin_quotes_created_at_idx ON public.admin_quotes (created_at DESC);
ALTER TABLE public.admin_quotes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_quotes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_quotes TO service_role;
COMMENT ON TABLE public.admin_quotes IS 'Private quotation snapshots. Access only through authenticated admin APIs or a scoped, unguessable share token validated server-side. No reservation is created.';
