-- Create tables for the project database

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    github_url VARCHAR(255),
    twitter_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    interactions INTEGER DEFAULT 0,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social metrics table
CREATE TABLE social_metrics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    github_stars INTEGER DEFAULT 0,
    github_forks INTEGER DEFAULT 0,
    github_last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    twitter_followers INTEGER DEFAULT 0,
    twitter_last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    project_freshness FLOAT DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX idx_contracts_address ON contracts(address);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_social_metrics_freshness ON social_metrics(project_freshness DESC);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 