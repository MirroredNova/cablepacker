CREATE TABLE IF NOT EXISTS presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cables (
  id SERIAL PRIMARY KEY,
  preset_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  diameter DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  id VARCHAR(12) PRIMARY KEY,
  input_cables JSONB NOT NULL,
  result_data JSONB NOT NULL,
  selected_preset_id INTEGER,
  cable_count INTEGER NOT NULL,
  bore_diameter DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cables_preset_id ON cables(preset_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at);
CREATE INDEX IF NOT EXISTS idx_results_preset_id ON results(selected_preset_id);

-- Optional: Create a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_presets_updated_at
  BEFORE UPDATE ON presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cables_updated_at
  BEFORE UPDATE ON cables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
