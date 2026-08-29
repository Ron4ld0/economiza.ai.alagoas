# Economiza.Ai Alagoas 🛒📊

O **Economiza.Ai Alagoas** é uma plataforma inteligente e focada em ajudar os consumidores alagoanos a encontrarem os menores preços de produtos de supermercado. Utilizando Inteligência Artificial e Geolocalização, o app cruza milhares de dados de preços para entregar o melhor custo-benefício diretamente no seu celular.

## 🚀 Funcionalidades Principais (MVP)

- 📍 **Feed de Ofertas Próximas**: Motor de busca geoespacial que encontra os produtos essenciais com maior desconto num raio de até 10km da sua localização atual.
- 🤖 **Assistente de IA Integrado (Gemini)**: Um chatbot inteligente (alimentado nativamente pela SDK do Google Gemini com Structured Outputs) que responde dúvidas sobre economia, realiza chamadas ao banco de dados (Tool Calling) e monta orçamentos dinâmicos.
- 🥩 **Listas & Cestas Temáticas**: Vai fazer um churrasco? Diga para quantas pessoas e a IA calcula a quantidade exata de ingredientes e onde comprá-los mais barato.
- 📸 **Scanner de Código de Barras**: Utilize a câmera do celular para escanear produtos direto da prateleira e verificar se estão mais baratos em outro lugar.
- 🔐 **Autenticação Segura**: Fluxo de login completo com JWT, suportando verificação por E-mail (PIN de 6 dígitos) e Single Sign-On (Google).

## 🛠 Arquitetura e Tecnologias

O projeto adota uma arquitetura em Monorepo, separando a API robusta do aplicativo mobile de alta performance:

### **Backend (Python)**
- **FastAPI** & **Uvicorn**: API REST de altíssima performance para consumo do frontend.
- **PostgreSQL** + **PostGIS**: Banco de dados relacional equipado com extensão espacial para consultas de raio e proximidade.
- **SQLAlchemy** & **Alembic**: Mapeamento Objeto-Relacional (ORM) e controle de migrações estruturais.
- **Google Gemini API**: Agente de Inteligência Artificial implementado nativamente utilizando o recurso de *JSON Structured Outputs* para interpretar linguagem natural de forma ultrarrápida.
- **PyJWT**: Geração e validação de tokens para autenticação stateless.

### **Frontend (Mobile - React Native)**
- **React Native** (via Expo): App cross-platform nativo para iOS e Android.
- **NativeWind (Tailwind CSS)**: Estilização rápida, moderna e consistente.
- **TanStack Query (React Query)**: Gerenciamento de estado de requisições, resiliência de rede e cache em memória otimizado.
- **React Navigation**: Roteamento por abas (Bottom Tabs) e pilhas de navegação.
- **Expo Camera & Location**: Acesso aos hardwares nativos do dispositivo (Câmera para código de barras e GPS para ofertas próximas).

## ⚙️ Como rodar o projeto localmente

### 1. Requisitos
- Node.js (v18+) e NPM/Yarn
- Python (3.10+)
- Docker e Docker Compose (para o Banco de Dados)
- App Expo Go no seu celular (opcional)

### 2. Infraestrutura Base
Na raiz do projeto, inicie os containers do banco de dados (PostgreSQL + PostGIS):
```bash
docker-compose up -d
```

### 3. Executando o Backend
Abra um terminal na pasta `backend/`:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # No Windows, use: venv\Scripts\activate
pip install -r requirements.txt

# Inicie a API na porta 8000
uv run uvicorn src.main:app --host 0.0.0.0 --reload
```
A API ficará acessível em `http://localhost:8000`.

### 4. Executando o Mobile
Abra outro terminal na pasta `mobile/`:
```bash
cd mobile
npm install

# Inicie o servidor Metro do Expo (limpando o cache)
npx expo start -c
```
Escaneie o QR Code usando o Expo Go no seu celular, ou aperte `a` no terminal para rodar no Emulador Android.

## 🤝 Como contribuir
As tarefas em andamento e o roadmap do projeto podem ser acompanhados na aba de [Issues](https://github.com/Ron4ld0/economiza.ai.alagoas/issues) no GitHub. Contribuições, pull requests e feedbacks são muito bem-vindos!
