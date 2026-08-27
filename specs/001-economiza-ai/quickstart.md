# Quickstart Validation Guide

Este guia detalha como testar as funcionalidades vitais (Motor Geoespacial e LLM) garantindo que a infraestrutura desenhada na arquitetura se comporta como esperado no desenvolvimento.

## Prerequisites
- Docker & Docker Compose (para PostgreSQL c/ extensões PostGIS e pgvector, além do Redis).
- Python 3.11+
- Node.js 18+ (Expo)

## Setup Services
1. Inicie a infraestrutura local:
   ```bash
   docker-compose up -d db redis
   ```
2. Configure o ambiente e banco do Backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Opcional: Rodar as migrations para criar tabelas (PostGIS e pgvector devem estar ativos)
   alembic upgrade head
   ```
3. Prepare o Frontend (Mobile):
   ```bash
   cd mobile
   npm install
   ```

## Validation Scenarios

### 1. Ingestão Similada de Preços (Backend)
Testa o preenchimento de dados de notas fiscais nas tabelas espaciais.
- **Ação**: Injetar notas fiscais mockadas no banco via script de seed.
- **Comando**: `python scripts/seed_mock_data.py`
- **Resultado Esperado**: O script roda sem erros. O banco passa a possuir linhas em `establishments` com colunas de geometria (PostGIS point) preenchidas, e produtos com valores base gerados em `price_records`.

### 2. Consulta Geoespacial Rápida (API)
Testa se a querie ST_DWithin (PostGIS) atende à expectativa de resposta (<500ms).
- **Ação**: Iniciar servidor FastAPI e testar busca por raio.
- **Comandos**: 
  ```bash
  cd backend
  uvicorn src.main:app --reload &
  # Consulta mockando usuário em Maceió (-9.6658, -35.7353)
  curl "http://localhost:8000/api/v1/feed?lat=-9.6658&lng=-35.7353&radius_km=5.0"
  ```
- **Resultado Esperado**: Retorno JSON válido contendo uma array `items`. Cada item deve obrigatoriamente trazer o `distance_km` (calculado via ST_Distance) e o `badge` respectivo (ex: "Preço Recorrente").

### 3. Extração Estruturada do LLM (API)
Testa o Módulo 5 (Assistant) para ver se ele mapeia intenções puramente textuais para os templates exatos do banco.
- **Ação**: Enviar um prompt complexo e verificar a formatação de saída.
- **Comando**:
  ```bash
  curl -X POST "http://localhost:8000/api/v1/assistant/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Vou fazer um churrasco pra 10 pessoas amanhã", "context": {"lat": 0, "lng": 0}}'
  ```
- **Resultado Esperado**: O payload de resposta deve conter não só a resposta em texto (`reply`) de saudação, mas o bloco `template_action` estruturado com o UUID do template e a quantidade `people_count: 10`.
