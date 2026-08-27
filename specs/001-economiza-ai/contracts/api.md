# Interface Contracts (API)

## REST API (FastAPI) - Versão 1

### 1. Geo-Spatial Feed
Busca produtos ao redor do usuário, ranqueados por menor preço.
- **Endpoint**: `GET /api/v1/feed`
- **Query Params**:
  - `lat`: float (required)
  - `lng`: float (required)
  - `radius_km`: float (default=5.0, max=25.0)
  - `category`: string (optional)
- **Response**: `200 OK`
  ```json
  {
    "items": [
      {
        "product_id": "uuid",
        "name": "Arroz Tio João 1kg",
        "price": 5.99,
        "establishment_name": "Supermercado X",
        "distance_km": 1.2,
        "badge": "Preço Recorrente"
      }
    ]
  }
  ```

### 2. Barcode Scan
Encontra o produto em locais próximos através do código de barras.
- **Endpoint**: `GET /api/v1/products/{ean}/prices`
- **Query Params**: `lat` (float, required), `lng` (float, required)
- **Response**: `200 OK`
  ```json
  {
    "product_name": "Refrigerante Coca-Cola 2L",
    "prices": [
      {
        "establishment_name": "Mercadinho Y",
        "distance_km": 0.5,
        "price": 8.50,
        "issued_at": "2026-08-27T10:00:00Z"
      }
    ]
  }
  ```

### 3. LLM Assistant Chat
Interface de chat natural para geração de listas (Módulo 5).
- **Endpoint**: `POST /api/v1/assistant/chat`
- **Payload**:
  ```json
  {
    "message": "churrasco pra 15 pessoas com R$300",
    "context": { "lat": -9.66, "lng": -35.73 }
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "reply": "Legal! Montei a lista de churrasco de acordo com o seu orçamento...",
    "template_action": {
      "template_id": "churrasco-uuid",
      "people_count": 15,
      "budget_limit": 300.0
    }
  }
  ```
