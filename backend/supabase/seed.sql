-- ===== DONNÉES INITIALES =====

-- Données de niveau d'eau (simulation)
INSERT INTO water_level (level, basin_name) VALUES
  (45.5, 'Basin 1'),
  (67.2, 'Basin 2'),
  (89.1, 'Basin 3');

-- Données de débit (simulation)
INSERT INTO flow_rate (inflow, outflow, basin_name) VALUES
  (120.5, 95.3, 'Basin 1'),
  (150.2, 140.8, 'Basin 2'),
  (95.0, 98.5, 'Basin 3');

-- Alertes existantes
INSERT INTO alerts (message, type, level, basin_name, read) VALUES
  ('Niveau d''eau critique - Basin 1', 'critical', 15.5, 'Basin 1', FALSE),
  ('Anomalie débit détectée - Basin 2', 'warning', 67.2, 'Basin 2', FALSE),
  ('Système fonctionnement normal', 'info', 50.0, 'Basin 3', TRUE);
