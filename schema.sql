-- =========================================================
-- SISTEMA DE PONDERACIÓN UEC · ESQUEMA D1
-- =========================================================
-- La aplicación crea esta tabla automáticamente cuando usa
-- /api/state. Este archivo se conserva como respaldo y para
-- que sea fácil revisar la estructura de la base.
-- =========================================================

CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
