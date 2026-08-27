# Phase 1: Data Model

## Relational Database (PostgreSQL + PostGIS + pgvector)

### Table: establishments
- **id**: UUID (Primary Key)
- **cnpj**: VARCHAR(14) (Unique, Indexed)
- **corporate_name**: VARCHAR(255)
- **trade_name**: VARCHAR(255)
- **location**: GEOMETRY(POINT, 4326) (Spatial Index - GiST)
- **address**: TEXT
- **updated_at**: TIMESTAMP WITH TIME ZONE

### Table: products_master
- **id**: UUID (Primary Key)
- **gtin_ean**: VARCHAR(14) (Unique, Indexed)
- **canonical_name**: VARCHAR(255)
- **category**: VARCHAR(100)
- **embedding**: VECTOR(384) (HNSW/IVFFlat Index for fast semantic similarity search)

### Table: price_records
- **id**: UUID (Primary Key)
- **establishment_id**: UUID (Foreign Key -> establishments.id)
- **product_id**: UUID (Foreign Key -> products_master.id)
- **raw_description**: VARCHAR(255)
- **unit_price**: DECIMAL(10,2)
- **issued_at**: TIMESTAMP WITH TIME ZONE (Indexed)
*(Note: Table should be partitioned by `issued_at` per day or month for query optimization and easy pruning of old data)*

### Table: templates
- **id**: UUID (Primary Key)
- **name**: VARCHAR(100) (e.g., "Churrasco")
- **category**: VARCHAR(100)
- **items**: JSONB (List of canonical items, required/optional flags, base quantities per person)

## Validation Rules
- **price_records.unit_price** > 0
- **establishments.cnpj** must be exactly 14 numeric digits.
- **price_records** geospatial feed queries must always default to append `issued_at > NOW() - INTERVAL '48 hours'` to prevent stale data.
