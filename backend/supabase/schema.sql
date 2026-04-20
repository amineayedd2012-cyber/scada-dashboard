-- ===== SCHEMA SUPABASE =====
-- Table pour les niveaux d'eau
CREATE TABLE IF NOT EXISTS water_level (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level FLOAT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  basin_name TEXT DEFAULT 'Basin 1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour le débit d'eau
CREATE TABLE IF NOT EXISTS flow_rate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inflow FLOAT NOT NULL,
  outflow FLOAT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  basin_name TEXT DEFAULT 'Basin 1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les alertes
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warning', 'critical', 'info')),
  level FLOAT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  basin_name TEXT DEFAULT 'Basin 1',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_water_level_timestamp ON water_level(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_flow_rate_timestamp ON flow_rate(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);

-- Activer Realtime
ALTER TABLE water_level REPLICA IDENTITY FULL;
ALTER TABLE flow_rate REPLICA IDENTITY FULL;
ALTER TABLE alerts REPLICA IDENTITY FULL;
