# Economiza.AI Alagoas 🛒📊

O **Economiza.AI Alagoas** é uma plataforma inteligente e open-source para monitoramento e busca de preços de produtos físicos no estado de Alagoas, utilizando dados reais de Notas Fiscais Eletrônicas (NFC-e) disponibilizados publicamente pela SEFAZ-AL.

## 🚀 Funcionalidades Principais
- 📍 **Busca Geoespacial (MVP)**: Encontre os menores preços num raio de 1km a 25km da sua localização.
- 📸 **Scanner de Código de Barras**: Leia o código de barras (EAN-13) de um produto na sua mão e descubra onde ele está mais barato na região.
- 🥩 **Cestas Temáticas (Ex: Churrasco)**: Selecione o número de convidados e receba a lista de compras matematicamente otimizada para o menor preço.
- 🤖 **Assistente de IA**: Converse naturalmente com o assistente (powered by LangChain) para montar listas complexas ou interpretar dados de preços.

## 🛠 Arquitetura e Tecnologias
O projeto adota uma arquitetura em Monorepo, separando a API e o aplicativo mobile:

- **Backend (Python)**:
  - `FastAPI`: API REST de altíssima performance.
  - `Celery` + `Redis`: Workers em background assíncronos para ingestão massiva dos dados da SEFAZ-AL, respeitando boas práticas para não sobrecarregar os servidores públicos.
  - `PostgreSQL` + `PostGIS` (Busca de Raio/Coordenadas) + `pgvector` (Buscas Semânticas por IA).
  - `SQLAlchemy` & `Alembic`: ORM e migrações.
  
- **Frontend (Mobile)**:
  - `React Native` (via Expo): App cross-platform (iOS e Android).
  - `NativeWind`: Estilização rápida e consistente via TailwindCSS.
  - `TanStack Query`: Resiliência de rede e cache de memória/AsyncStorage (Offline-first support).

## ⚙️ Como rodar o projeto localmente

### 1. Requisitos
- Node.js (v18+) e NPM/Yarn
- Python (3.10+)
- Docker e Docker Compose
- App Expo Go no seu celular (opcional)

### 2. Infraestrutura Base
Na raiz do projeto, inicie os containers do banco de dados (PostgreSQL) e do Redis:
```bash
docker-compose up -d
```

### 3. Executando o Backend
Abra um terminal na pasta `backend/`:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # No Windows
pip install -r requirements.txt

# Crie o arquivo .env contendo a chave da SEFAZ
# SEFAZ_AL_APP_TOKEN=seu_token_aqui

# Inicie a API
uvicorn src.main:app --reload
```
A API ficará acessível em `http://localhost:8000`.

### 4. Executando o Mobile
Abra outro terminal na pasta `mobile/`:
```bash
cd mobile
npm install

# Inicie o servidor Metro do Expo
npx expo start
```
Escaneie o QR Code usando o Expo Go no seu celular, ou aperte `a` para rodar no Emulador Android.

## 🤝 Como contribuir
O projeto utiliza a metodologia **SpecKit** para gestão de tarefas e documentação. As tarefas em andamento podem ser acompanhadas pela aba de [Issues](https://github.com/Ron4ld0/economiza.ai.alagoas/issues) no GitHub.
